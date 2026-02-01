#include "Timeline.h"
#include <QPainter>
#include <QMouseEvent>
#include <QWheelEvent>
#include <QFileDialog>
#include <QSizePolicy>
#include <QProcess>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>

Timeline::Timeline(QWidget *parent)
    : QWidget(parent)
    , m_selectedClipIndex(-1)
    , m_pixelsPerSecond(50.0)
    , m_scrollOffset(0.0)
    , m_playheadPosition(0.0)
    , m_isDragging(false)
    , m_isResizing(false)
    , m_isPanning(false)
    , m_dragClipIndex(-1)
{
    setupUI();
    setMinimumHeight(150);
    setMouseTracking(true);
    setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
}

Timeline::~Timeline()
{
}

void Timeline::setupUI()
{
    // Don't use a layout - we'll manually position buttons and paint clips
    // This allows paintEvent to have full control over the widget area
    
    m_addClipButton = new QPushButton("Add Clip", this);
    m_removeClipButton = new QPushButton("Remove Clip", this);
    m_removeClipButton->setEnabled(false);
    
    // Position buttons at the top-left
    m_addClipButton->move(5, 5);
    m_removeClipButton->move(m_addClipButton->x() + m_addClipButton->sizeHint().width() + 5, 5);
    
    // Ensure buttons are visible above the painted content
    m_addClipButton->raise();
    m_removeClipButton->raise();
    
    connect(m_addClipButton, &QPushButton::clicked, this, &Timeline::onAddClipClicked);
    connect(m_removeClipButton, &QPushButton::clicked, this, &Timeline::onRemoveClipClicked);
}

void Timeline::addClip(const QString &filePath, double startTime, double duration)
{
    Clip clip(filePath, startTime, duration);
    m_clips.append(clip);
    emit clipAdded(m_clips.size() - 1);
    emit timelineChanged();
    update();
}

void Timeline::removeClip(int index)
{
    if (index >= 0 && index < m_clips.size()) {
        m_clips.remove(index);
        if (m_selectedClipIndex == index) {
            m_selectedClipIndex = -1;
            m_removeClipButton->setEnabled(false);
        }
        emit clipRemoved(index);
        emit timelineChanged();
        update();
    }
}

void Timeline::clearClips()
{
    m_clips.clear();
    m_selectedClipIndex = -1;
    m_removeClipButton->setEnabled(false);
    emit timelineChanged();
    update();
}

double Timeline::totalDuration() const
{
    double maxEnd = 0.0;
    for (const Clip &clip : m_clips) {
        double end = clip.endTime();
        if (end > maxEnd) {
            maxEnd = end;
        }
    }
    return maxEnd;
}

void Timeline::setPlayheadPosition(double time)
{
    if (m_playheadPosition != time) {
        m_playheadPosition = time;
        update();
    }
}

void Timeline::paintEvent(QPaintEvent *event)
{
    Q_UNUSED(event);
    QPainter painter(this);
    painter.setRenderHint(QPainter::Antialiasing);
    
    // Button area height (buttons are positioned at y=5, typical button height ~25)
    int buttonAreaHeight = 35;
    
    // Draw background
    painter.fillRect(rect(), QColor(45, 45, 45));
    
    // Draw timeline ruler below button area
    int rulerY = buttonAreaHeight;
    int rulerHeight = 30;
    painter.fillRect(0, rulerY, width(), rulerHeight, QColor(60, 60, 60));
    
    // Draw time markers
    painter.setPen(QColor(200, 200, 200));
    QFont font = painter.font();
    font.setPointSize(8);
    painter.setFont(font);
    
    for (int i = 0; i < width(); i += 100) {
        double time = pixelToTime(i);
        painter.drawLine(i, rulerY + rulerHeight - 10, i, rulerY + rulerHeight);
        painter.drawText(i + 2, rulerY + rulerHeight - 15, QString::number(time, 'f', 1) + "s");
    }
    
    // Draw clips below the ruler
    int clipAreaY = rulerY + rulerHeight + 10;
    int clipAreaHeight = 60;
    
    // Draw clip track background (slightly different color to show the area)
    painter.fillRect(0, clipAreaY, width(), clipAreaHeight, QColor(55, 55, 55));
    
    // Draw each clip
    for (int i = 0; i < m_clips.size(); ++i) {
        painter.save();
        painter.translate(0, clipAreaY);
        drawClip(painter, m_clips[i], i);
        painter.restore();
    }
    
    // Draw playhead indicator
    int playheadX = timeToPixel(m_playheadPosition);
    if (playheadX >= 0 && playheadX <= width()) {
        painter.setPen(QPen(QColor(255, 0, 0), 2));
        painter.drawLine(playheadX, rulerY, playheadX, height());
        
        // Draw playhead triangle at top
        QPolygon triangle;
        triangle << QPoint(playheadX, rulerY)
                 << QPoint(playheadX - 6, rulerY - 10)
                 << QPoint(playheadX + 6, rulerY - 10);
        painter.setBrush(QColor(255, 0, 0));
        painter.drawPolygon(triangle);
    }
}

void Timeline::drawClip(QPainter &painter, const Clip &clip, int index)
{
    int x = timeToPixel(clip.startTime());
    int clipWidth = timeToPixel(clip.duration());
    int height = 60;
    
    // Ensure minimum width for visibility
    if (clipWidth < 50) {
        clipWidth = 50;
    }
    
    // Clip background
    QColor clipColor = (index == m_selectedClipIndex) ? QColor(100, 150, 255) : QColor(80, 120, 200);
    painter.fillRect(x, 0, clipWidth, height, clipColor);
    
    // Clip border
    painter.setPen(QPen(QColor(255, 255, 255), 2));
    painter.drawRect(x, 0, clipWidth, height);
    
    // Clip label
    painter.setPen(QColor(255, 255, 255));
    QFont font = painter.font();
    font.setPointSize(9);
    painter.setFont(font);
    
    QString fileName = clip.filePath().split('/').last();
    QFontMetrics fm(font);
    QString elidedText = fm.elidedText(fileName, Qt::ElideMiddle, clipWidth - 10);
    painter.drawText(x + 5, 20, elidedText);
    
    // Duration text
    QString durationText = QString::number(clip.duration(), 'f', 2) + "s";
    painter.drawText(x + 5, 40, durationText);
    
    // Trim indicators
    if (clip.trimStart() > 0 || clip.trimEnd() > 0) {
        painter.setPen(QPen(QColor(255, 200, 0), 2));
        if (clip.trimStart() > 0) {
            painter.drawLine(x + 5, 0, x + 5, height);
        }
        if (clip.trimEnd() > 0) {
            painter.drawLine(x + clipWidth - 5, 0, x + clipWidth - 5, height);
        }
    }
}

void Timeline::mousePressEvent(QMouseEvent *event)
{
    if (event->button() == Qt::LeftButton) {
        int clipIndex = getClipAtPosition(event->pos());
        
        if (clipIndex >= 0) {
            m_selectedClipIndex = clipIndex;
            m_isDragging = true;
            m_dragClipIndex = clipIndex;
            m_lastMousePos = event->pos();
            m_removeClipButton->setEnabled(true);
            emit clipSelected(clipIndex);
            update();
        } else {
            m_selectedClipIndex = -1;
            m_removeClipButton->setEnabled(false);
            update();
        }
    } else if (event->button() == Qt::MiddleButton) {
        m_isPanning = true;
        m_lastMousePos = event->pos();
        setCursor(Qt::ClosedHandCursor);
    }
}

void Timeline::mouseMoveEvent(QMouseEvent *event)
{
    if (m_isDragging && m_dragClipIndex >= 0) {
        int dx = event->pos().x() - m_lastMousePos.x();
        double dt = dx / m_pixelsPerSecond; // Use raw pixels for drag
        
        Clip &clip = m_clips[m_dragClipIndex];
        double newStartTime = clip.startTime() + dt;
        if (newStartTime >= 0) {
            clip.setStartTime(newStartTime);
            m_lastMousePos = event->pos();
            emit timelineChanged();
            update();
        }
    } else if (m_isPanning) {
        int dx = event->pos().x() - m_lastMousePos.x();
        m_scrollOffset -= dx;
        if (m_scrollOffset < 0) m_scrollOffset = 0;
        m_lastMousePos = event->pos();
        update();
    }
}

void Timeline::mouseReleaseEvent(QMouseEvent *event)
{
    if (event->button() == Qt::LeftButton) {
        m_isDragging = false;
        m_isResizing = false;
        m_dragClipIndex = -1;
    } else if (event->button() == Qt::MiddleButton) {
        m_isPanning = false;
        setCursor(Qt::ArrowCursor);
    }
}

void Timeline::wheelEvent(QWheelEvent *event)
{
    double zoomFactor = 1.15;
    if (event->angleDelta().y() < 0) {
        zoomFactor = 1.0 / zoomFactor;
    }

    double mouseX = event->position().x();
    double timeAtMouse = pixelToTime(mouseX);

    // Apply zoom
    m_pixelsPerSecond *= zoomFactor;

    // Limit zoom
    if (m_pixelsPerSecond < 2.0) m_pixelsPerSecond = 2.0;
    if (m_pixelsPerSecond > 2000.0) m_pixelsPerSecond = 2000.0;

    // Adjust scroll offset to keep timeAtMouse at mouseX
    m_scrollOffset = timeAtMouse * m_pixelsPerSecond - mouseX;

    if (m_scrollOffset < 0) m_scrollOffset = 0;

    update();
}

int Timeline::getClipAtPosition(const QPoint &pos)
{
    int buttonAreaHeight = 35;
    int rulerHeight = 30;
    int clipAreaY = buttonAreaHeight + rulerHeight + 10;
    int clipHeight = 60;
    
    // Check if click is in the clip area
    if (pos.y() < clipAreaY || pos.y() > clipAreaY + clipHeight) {
        return -1;
    }
    
    double time = pixelToTime(pos.x());
    
    for (int i = 0; i < m_clips.size(); ++i) {
        const Clip &clip = m_clips[i];
        if (time >= clip.startTime() && time <= clip.endTime()) {
            return i;
        }
    }
    
    return -1;
}

double Timeline::pixelToTime(int pixel) const
{
    return (pixel + m_scrollOffset) / m_pixelsPerSecond;
}

int Timeline::timeToPixel(double time) const
{
    return static_cast<int>(time * m_pixelsPerSecond - m_scrollOffset);
}

void Timeline::onAddClipClicked()
{
    QString fileName = QFileDialog::getOpenFileName(
        this,
        "Select Video File",
        QString(),
        "Video Files (*.mp4 *.avi *.mkv *.mov);;All Files (*)"
    );

    if (!fileName.isEmpty()) {
        // Add clip at the end of timeline
        double startTime = totalDuration();
        double duration = getVideoDuration(fileName);
        if (duration <= 0.0) {
            duration = 5.0; // Fallback default duration
        }
        addClip(fileName, startTime, duration);
    }
}

void Timeline::onRemoveClipClicked()
{
    if (m_selectedClipIndex >= 0) {
        removeClip(m_selectedClipIndex);
    }
}

double Timeline::getVideoDuration(const QString &filePath) const
{
    // Use ffprobe to get video duration
    QProcess process;
    QStringList arguments;
    arguments << "-v" << "error"
              << "-show_entries" << "format=duration"
              << "-of" << "default=noprint_wrappers=1:nokey=1"
              << filePath;

    process.start("ffprobe", arguments);
    if (!process.waitForFinished(5000)) {
        return 0.0;
    }

    QString output = QString::fromUtf8(process.readAllStandardOutput()).trimmed();
    bool ok;
    double duration = output.toDouble(&ok);
    return ok ? duration : 0.0;
}
