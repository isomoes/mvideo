#include "MainWindow.h"
#include "Timeline.h"
#include <QAction>
#include <QFile>
#include <QFileDialog>
#include <QHBoxLayout>
#include <QKeySequence>
#include <QMenu>
#include <QMenuBar>
#include <QMetaObject>
#include <QOpenGLContext>
#include <QOpenGLFunctions>
#include <QOpenGLWidget>
#include <QtGlobal>
#include <QSlider>
#include <QToolButton>
#include <QTimer>
#include <QVBoxLayout>
#include <QWidget>
#include <QDebug>
#include <mpv/render.h>
#include <mpv/render_gl.h>
#include <algorithm>
#include <cmath>
#include <clocale>

namespace {

class MpvVideoWidget : public QOpenGLWidget, protected QOpenGLFunctions
{
public:
    explicit MpvVideoWidget(QWidget *parent = nullptr)
        : QOpenGLWidget(parent)
        , mpv(nullptr)
        , mpvGl(nullptr)
    {
        setUpdateBehavior(QOpenGLWidget::NoPartialUpdate);
    }

    ~MpvVideoWidget() override
    {
        shutdown();
    }

    void setMpv(mpv_handle *handle)
    {
        mpv = handle;
        if (mpv && context() && !mpvGl) {
            initRenderContext();
        }
    }

    void shutdown()
    {
        if (mpvGl) {
            mpv_render_context_free(mpvGl);
            mpvGl = nullptr;
        }
        mpv = nullptr;
    }

protected:
    void initializeGL() override
    {
        initializeOpenGLFunctions();
        if (mpv && !mpvGl) {
            initRenderContext();
        }
    }

    void paintGL() override
    {
        if (!mpvGl) {
            glClearColor(0.05f, 0.05f, 0.05f, 1.0f);
            glClear(GL_COLOR_BUFFER_BIT);
            return;
        }

        const qreal dpr = devicePixelRatio();
        mpv_opengl_fbo fbo = {
            static_cast<int>(defaultFramebufferObject()),
            static_cast<int>(width() * dpr),
            static_cast<int>(height() * dpr),
            0
        };
        int flip = 1;
        mpv_render_param params[] = {
            { MPV_RENDER_PARAM_OPENGL_FBO, &fbo },
            { MPV_RENDER_PARAM_FLIP_Y, &flip },
            { MPV_RENDER_PARAM_INVALID, nullptr }
        };
        mpv_render_context_render(mpvGl, params);
    }

    void resizeGL(int w, int h) override
    {
        Q_UNUSED(w);
        Q_UNUSED(h);
        update();
    }

private:
    mpv_handle *mpv;
    mpv_render_context *mpvGl;

    static void *getProcAddress(void *ctx, const char *name)
    {
        Q_UNUSED(ctx);
        QOpenGLContext *glctx = QOpenGLContext::currentContext();
        if (!glctx) {
            return nullptr;
        }
        return reinterpret_cast<void *>(glctx->getProcAddress(QByteArray(name)));
    }

    static void onMpvUpdate(void *ctx)
    {
        MpvVideoWidget *self = static_cast<MpvVideoWidget *>(ctx);
        QMetaObject::invokeMethod(self, "update", Qt::QueuedConnection);
    }

    void initRenderContext()
    {
        mpv_opengl_init_params glInit = { getProcAddress, this };
        mpv_render_param params[] = {
            { MPV_RENDER_PARAM_API_TYPE, const_cast<char *>(MPV_RENDER_API_TYPE_OPENGL) },
            { MPV_RENDER_PARAM_OPENGL_INIT_PARAMS, &glInit },
            { MPV_RENDER_PARAM_INVALID, nullptr }
        };
        if (mpv_render_context_create(&mpvGl, mpv, params) < 0) {
            qDebug() << "mpv render context init failed";
            mpvGl = nullptr;
            return;
        }
        mpv_render_context_set_update_callback(mpvGl, onMpvUpdate, this);
    }
};

} // namespace

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , mpv(nullptr)
    , videoContainer(nullptr)
    , playPauseButton(nullptr)
    , seekSlider(nullptr)
    , positionTimer(nullptr)
    , userSeeking(false)
    , mediaDuration(0.0)
    , timeline(nullptr)
    , usingTimelinePlaylist(false)
    , currentTimelinePos(0.0)
{
    setupUI();
    initializeMpv();
}

void MainWindow::setupUI()
{
    QMenu *fileMenu = menuBar()->addMenu(tr("&File"));
    QAction *openAction = fileMenu->addAction(tr("&Open..."));
    openAction->setShortcut(QKeySequence::Open);
    connect(openAction, &QAction::triggered, this, &MainWindow::openFile);

    // Create a central widget and layout
    QWidget *centralWidget = new QWidget(this);
    setCentralWidget(centralWidget);
    QVBoxLayout *layout = new QVBoxLayout(centralWidget);
    layout->setContentsMargins(0, 0, 0, 0);

    // Create a container for the video
    videoContainer = new MpvVideoWidget(this);
    videoContainer->setMinimumSize(640, 480);
    layout->addWidget(videoContainer, 2);

    QWidget *controlsWidget = new QWidget(this);
    QHBoxLayout *controlsLayout = new QHBoxLayout(controlsWidget);
    controlsLayout->setContentsMargins(8, 6, 8, 6);
    playPauseButton = new QToolButton(controlsWidget);
    playPauseButton->setText(tr("Play"));
    playPauseButton->setEnabled(false);
    connect(playPauseButton, &QToolButton::clicked, this, &MainWindow::playPause);

    seekSlider = new QSlider(Qt::Horizontal, controlsWidget);
    seekSlider->setRange(0, 0);
    seekSlider->setEnabled(false);
    connect(seekSlider, &QSlider::sliderPressed, this, &MainWindow::beginSeek);
    connect(seekSlider, &QSlider::sliderReleased, this, &MainWindow::endSeek);

    controlsLayout->addWidget(playPauseButton);
    controlsLayout->addWidget(seekSlider, 1);
    layout->addWidget(controlsWidget);

    positionTimer = new QTimer(this);
    positionTimer->setInterval(250);
    connect(positionTimer, &QTimer::timeout, this, &MainWindow::updatePosition);
    positionTimer->start();

    // Create timeline widget
    timeline = new Timeline(this);
    layout->addWidget(timeline, 1);
    
    // Connect timeline signals
    connect(timeline, &Timeline::clipSelected, this, &MainWindow::onClipSelected);
    connect(timeline, &Timeline::timelineChanged, this, &MainWindow::onTimelineChanged);
}

MainWindow::~MainWindow()
{
    if (videoContainer) {
        if (auto *mpvWidget = dynamic_cast<MpvVideoWidget *>(videoContainer)) {
            mpvWidget->shutdown();
        }
    }
    if (mpv) {
        mpv_terminate_destroy(mpv);
    }
}

void MainWindow::initializeMpv()
{
    // MPV uses C locale
    std::setlocale(LC_NUMERIC, "C");

    mpv = mpv_create();
    if (!mpv) {
        qDebug() << "failed creating context";
        return;
    }

    // Enable default bindings
    mpv_set_option_string(mpv, "input-default-bindings", "yes");
    mpv_set_option_string(mpv, "input-vo-keyboard", "yes");

    // Use libmpv render API (required on Wayland)
    mpv_set_option_string(mpv, "vo", "libmpv");

    // Initialize the MPV instance
    if (mpv_initialize(mpv) < 0) {
        qDebug() << "mpv init failed";
        return;
    }

    if (videoContainer) {
        if (auto *mpvWidget = dynamic_cast<MpvVideoWidget *>(videoContainer)) {
            mpvWidget->setMpv(mpv);
        }
    }
    
    // Play a test video (optional, can be removed later)
    // const char *cmd[] = {"loadfile", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", NULL};
    // mpv_command(mpv, cmd);
}

void MainWindow::openFile()
{
    if (!mpv) {
        return;
    }

    const QString fileName = QFileDialog::getOpenFileName(
        this,
        tr("Open Video"),
        QString(),
        tr("Video Files (*.mp4 *.mkv *.avi *.mov *.webm *.mpg *.mpeg *.m4v);;All Files (*)"));

    if (fileName.isEmpty()) {
        return;
    }

    const QByteArray fileBytes = QFile::encodeName(fileName);
    const char *cmd[] = {"loadfile", fileBytes.constData(), NULL};
    mpv_command(mpv, cmd);
    mpv_set_property_string(mpv, "pause", "no");

    usingTimelinePlaylist = false;
    timelineSegments.clear();
    currentTimelinePos = 0.0;

    mediaDuration = 0.0;
    seekSlider->setRange(0, 0);
    playPauseButton->setEnabled(true);
    seekSlider->setEnabled(true);
    updatePlayButton(true);
}

void MainWindow::playPause()
{
    if (!mpv) {
        return;
    }

    int paused = 0;
    if (mpv_get_property(mpv, "pause", MPV_FORMAT_FLAG, &paused) < 0) {
        return;
    }

    int newPaused = paused ? 0 : 1;
    mpv_set_property(mpv, "pause", MPV_FORMAT_FLAG, &newPaused);
    updatePlayButton(newPaused == 0);
}

void MainWindow::updatePosition()
{
    if (!mpv || userSeeking) {
        return;
    }

    if (usingTimelinePlaylist && !timelineSegments.isEmpty()) {
        int64_t playlistPos = 0;
        if (mpv_get_property(mpv, "playlist-pos", MPV_FORMAT_INT64, &playlistPos) >= 0) {
            double position = 0.0;
            if (mpv_get_property(mpv, "time-pos", MPV_FORMAT_DOUBLE, &position) >= 0) {
                if (playlistPos >= 0 && playlistPos < timelineSegments.size()) {
                    const TimelineSegment &segment = timelineSegments.at(static_cast<int>(playlistPos));
                    double timelinePos = segment.timelineStart + position;
                    currentTimelinePos = timelinePos;
                    const int sliderValue = static_cast<int>(timelinePos * 1000.0);
                    seekSlider->blockSignals(true);
                    seekSlider->setValue(sliderValue);
                    seekSlider->blockSignals(false);
                }
            }
        }

        int paused = 0;
        if (mpv_get_property(mpv, "pause", MPV_FORMAT_FLAG, &paused) >= 0) {
            updatePlayButton(paused == 0);
        }
        return;
    }

    double duration = 0.0;
    if (mpv_get_property(mpv, "duration", MPV_FORMAT_DOUBLE, &duration) >= 0 && duration > 0.0) {
        if (mediaDuration <= 0.0 || std::fabs(duration - mediaDuration) > 0.5) {
            mediaDuration = duration;
            seekSlider->setRange(0, static_cast<int>(mediaDuration * 1000.0));
        }
    }

    double position = 0.0;
    if (mpv_get_property(mpv, "time-pos", MPV_FORMAT_DOUBLE, &position) >= 0) {
        const int sliderValue = static_cast<int>(position * 1000.0);
        seekSlider->blockSignals(true);
        seekSlider->setValue(sliderValue);
        seekSlider->blockSignals(false);
    }

    int paused = 0;
    if (mpv_get_property(mpv, "pause", MPV_FORMAT_FLAG, &paused) >= 0) {
        updatePlayButton(paused == 0);
    }
}

void MainWindow::beginSeek()
{
    userSeeking = true;
}

void MainWindow::endSeek()
{
    if (!mpv) {
        userSeeking = false;
        return;
    }

    const int sliderValue = seekSlider->value();
    double position = sliderValue / 1000.0;
    if (usingTimelinePlaylist) {
        seekToTimelineTime(position);
    } else {
        mpv_set_property(mpv, "time-pos", MPV_FORMAT_DOUBLE, &position);
    }
    userSeeking = false;
}

void MainWindow::updatePlayButton(bool isPlaying)
{
    if (!playPauseButton) {
        return;
    }

    playPauseButton->setText(isPlaying ? tr("Pause") : tr("Play"));
}

void MainWindow::onClipSelected(int index)
{
    qDebug() << "Clip selected:" << index;
    const QVector<Clip>& clips = timeline->clips();
    if (index >= 0 && index < clips.size()) {
        const Clip &clip = clips[index];
        rebuildTimelinePlaylist(true);
        seekToTimelineTime(clip.startTime());
    }
}

void MainWindow::onTimelineChanged()
{
    rebuildTimelinePlaylist(true);
}

void MainWindow::rebuildTimelinePlaylist(bool preservePosition)
{
    if (!mpv || !timeline) {
        return;
    }

    double previousTimelinePos = currentTimelinePos;
    int paused = 0;
    mpv_get_property(mpv, "pause", MPV_FORMAT_FLAG, &paused);

    timelineSegments.clear();
    QVector<Clip> sortedClips = timeline->clips();
    std::sort(sortedClips.begin(), sortedClips.end(), [](const Clip &a, const Clip &b) {
        return a.startTime() < b.startTime();
    });

    double cursor = 0.0;
    for (const Clip &clip : sortedClips) {
        if (clip.duration() <= 0.0) {
            continue;
        }

        double start = clip.startTime();
        if (start < 0.0) {
            start = 0.0;
        }

        if (start > cursor) {
            TimelineSegment gapSegment;
            gapSegment.timelineStart = cursor;
            gapSegment.duration = start - cursor;
            gapSegment.trimStart = 0.0;
            gapSegment.isGap = true;
            gapSegment.source = QString("lavfi:color=c=black:s=1280x720:r=30:d=%1")
                                   .arg(gapSegment.duration, 0, 'f', 3);
            timelineSegments.append(gapSegment);
            cursor = start;
        }

        TimelineSegment segment;
        segment.timelineStart = start;
        segment.duration = clip.duration();
        segment.trimStart = clip.trimStart();
        segment.isGap = false;
        segment.source = clip.filePath();
        timelineSegments.append(segment);
        cursor = std::max(cursor, start + clip.duration());
    }

    if (timelineSegments.isEmpty()) {
        const char *cmd[] = {"playlist-clear", NULL};
        mpv_command(mpv, cmd);
        usingTimelinePlaylist = false;
        mediaDuration = 0.0;
        seekSlider->setRange(0, 0);
        playPauseButton->setEnabled(false);
        seekSlider->setEnabled(false);
        currentTimelinePos = 0.0;
        return;
    }

    const char *clearCmd[] = {"playlist-clear", NULL};
    mpv_command(mpv, clearCmd);

    bool first = true;
    for (const TimelineSegment &segment : timelineSegments) {
        QByteArray sourceBytes = QFile::encodeName(segment.source);
        const char *mode = first ? "replace" : "append";
        QByteArray startOption;
        QByteArray endOption;
        if (!segment.isGap) {
            double clipStart = segment.trimStart;
            double clipEnd = segment.trimStart + segment.duration;
            startOption = QByteArray("start=") + QByteArray::number(clipStart, 'f', 3);
            endOption = QByteArray("end=") + QByteArray::number(clipEnd, 'f', 3);
        }

        if (!segment.isGap) {
            const char *cmd[] = {"loadfile", sourceBytes.constData(), mode, startOption.constData(), endOption.constData(), NULL};
            mpv_command(mpv, cmd);
        } else {
            const char *cmd[] = {"loadfile", sourceBytes.constData(), mode, NULL};
            mpv_command(mpv, cmd);
        }
        first = false;
    }

    usingTimelinePlaylist = true;
    mediaDuration = timeline->totalDuration();
    seekSlider->setRange(0, static_cast<int>(mediaDuration * 1000.0));
    playPauseButton->setEnabled(true);
    seekSlider->setEnabled(true);

    if (preservePosition) {
        seekToTimelineTime(previousTimelinePos);
    }

    mpv_set_property(mpv, "pause", MPV_FORMAT_FLAG, &paused);
}

void MainWindow::seekToTimelineTime(double timelineTime)
{
    if (!mpv || timelineSegments.isEmpty()) {
        return;
    }

    if (timelineTime < 0.0) {
        timelineTime = 0.0;
    }

    double totalDuration = timeline->totalDuration();
    if (totalDuration > 0.0 && timelineTime > totalDuration) {
        timelineTime = totalDuration;
    }

    int index = -1;
    double localPos = 0.0;
    if (!segmentForTimelineTime(timelineTime, index, localPos)) {
        return;
    }

    int64_t playlistPos = index;
    mpv_set_property(mpv, "playlist-pos", MPV_FORMAT_INT64, &playlistPos);
    mpv_set_property(mpv, "time-pos", MPV_FORMAT_DOUBLE, &localPos);
    currentTimelinePos = timelineTime;
}

bool MainWindow::segmentForTimelineTime(double timelineTime, int &index, double &localPos) const
{
    if (timelineSegments.isEmpty()) {
        return false;
    }

    for (int i = 0; i < timelineSegments.size(); ++i) {
        const TimelineSegment &segment = timelineSegments.at(i);
        if (timelineTime >= segment.timelineStart && timelineTime <= segment.timelineStart + segment.duration) {
            index = i;
            localPos = timelineTime - segment.timelineStart;
            return true;
        }
    }

    const TimelineSegment &lastSegment = timelineSegments.last();
    index = timelineSegments.size() - 1;
    localPos = std::max(0.0, lastSegment.duration - 0.01);
    return true;
}

bool MainWindow::timelinePositionForMpv(double &timelinePos) const
{
    if (!mpv || !usingTimelinePlaylist) {
        return false;
    }

    int64_t playlistPos = 0;
    if (mpv_get_property(mpv, "playlist-pos", MPV_FORMAT_INT64, &playlistPos) < 0) {
        return false;
    }

    double position = 0.0;
    if (mpv_get_property(mpv, "time-pos", MPV_FORMAT_DOUBLE, &position) < 0) {
        return false;
    }

    if (playlistPos < 0 || playlistPos >= timelineSegments.size()) {
        return false;
    }

    const TimelineSegment &segment = timelineSegments.at(static_cast<int>(playlistPos));
    timelinePos = segment.timelineStart + position;
    return true;
}
