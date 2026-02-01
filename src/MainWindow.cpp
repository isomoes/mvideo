#include "MainWindow.h"
#include "Timeline.h"
#include <QAction>
#include <QFile>
#include <QFileDialog>
#include <QHBoxLayout>
#include <QKeySequence>
#include <QMenu>
#include <QMenuBar>
#include <QSlider>
#include <QToolButton>
#include <QTimer>
#include <QVBoxLayout>
#include <QWidget>
#include <QDebug>
#include <mpv/render_gl.h>
#include <cmath>
#include <clocale>

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
    videoContainer = new QWidget(this);
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
    
    // Set the window ID for MPV to render into
    int64_t wid = videoContainer->winId();
    mpv_set_property(mpv, "wid", MPV_FORMAT_INT64, &wid);

    // Initialize the MPV instance
    if (mpv_initialize(mpv) < 0) {
        qDebug() << "mpv init failed";
        return;
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
    mpv_set_property(mpv, "time-pos", MPV_FORMAT_DOUBLE, &position);
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
    
    // Load and play the selected clip
    const QVector<Clip>& clips = timeline->clips();
    if (index >= 0 && index < clips.size()) {
        const Clip &clip = clips[index];
        const char *cmd[] = {"loadfile", clip.filePath().toUtf8().constData(), NULL};
        mpv_command(mpv, cmd);
        
        // Seek to trim start if needed
        if (clip.trimStart() > 0) {
            double trimStart = clip.trimStart();
            mpv_set_property_async(mpv, 0, "time-pos", MPV_FORMAT_DOUBLE, &trimStart);
        }
    }
}

void MainWindow::onTimelineChanged()
{
    qDebug() << "Timeline changed, total duration:" << timeline->totalDuration();
}
