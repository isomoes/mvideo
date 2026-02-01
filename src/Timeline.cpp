#include "Timeline.h"
#include <QPainter>
#include <QMouseEvent>
#include <QFileDialog>
#include <QHBoxLayout>
#include <QVBoxLayout>
#include <QDebug>

Timeline::Timeline(QWidget *parent)
    : QWidget(parent)
    , m_selectedClipIndex(-1)
    , m_pixelsPerSecond(50.0)
    , m_isDragging(false)
    , m_isResizing(false)
    , m_dragClipIndex(-1)
{
    setupUI();
    setMinimumHeight(150);
    setMouseTracking(true);
}

Timeline::~Timeline()
{
}

void Timeline::setupUI()
{
    QVBoxLayout *mainLayout = new QVBoxLayout(this);
    
    // Button bar
    QHBoxLayout *buttonLayout = new QHBoxLayout();
    m_addClipButton = new QPushButton("Add Clip", this);
    m_removeClipButton = new QPushButton("Remove Clip", this);
    m_removeClipButton->setEnabled(false);
    
    buttonLayout->addWidget(m_addClipButton);
    buttonLayout->addWidget(m_removeClipButton);
    buttonLayout->addStretch();
    
    mainLayout->addLayout(buttonLayout);
    mainLayout->addStretch();
    
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

void Timeline::paintEvent(QPaintEvent *event)
{
    QPainter painter(this);
    painter.setRenderHint(QPainter::Antialiasing);
    
    // Draw background
    painter.fillRect(rect(), QColor(45, 45, 45));
    
    // Draw timeline ruler
    int rulerHeight = 30;
    painter.fillRect(0, 0, width(), rulerHeight, QColor(60, 60, 60));
    
    // Draw time markers
    painter.setPen(QColor(200, 200, 200));
    QFont font = painter.font();
    font.setPointSize(8);
    painter.setFont(font);
    
    for (int i = 0; i < width(); i += 100) {
        double time = pixelToTime(i);
        painter.drawLine(i, rulerHeight - 10, i, rulerHeight);
        painter.drawText(i + 2, rulerHeight - 15, QString::number(time, 'f', 1) + "s");
    }
    
    // Draw clips
    painter.translate(0, rulerHeight + 10);
    for (int i = 0; i < m_clips.size(); ++i) {
        drawClip(painter, m_clips[i], i);
    }
}

void Timeline::drawClip(QPainter &painter, const Clip &clip, int index)
{
    int x = timeToPixel(clip.startTime());
    int width = timeToPixel(clip.duration());
    int height = 60;
    
    // Clip background
    QColor clipColor = (index == m_selectedClipIndex) ? QColor(100, 150, 255) : QColor(80, 120, 200);
    painter.fillRect(x, 0, width, height, clipColor);
    
    // Clip border
    painter.setPen(QPen(QColor(255, 255, 255), 2));
    painter.drawRect(x, 0, width, height);
    
    // Clip label
    painter.setPen(QColor(255, 255, 255));
    QFont font = painter.font();
    font.setPointSize(9);
    painter.setFont(font);
    
    QString fileName = clip.filePath().split('/').last();
    QFontMetrics fm(font);
    QString elidedText = fm.elidedText(fileName, Qt::ElideMiddle, width - 10);
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
            painter.drawLine(x + width - 5, 0, x + width - 5, height);
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
    }
}

void Timeline::mouseMoveEvent(QMouseEvent *event)
{
    if (m_isDragging && m_dragClipIndex >= 0) {
        int dx = event->pos().x() - m_lastMousePos.x();
        double dt = pixelToTime(dx);
        
        Clip &clip = m_clips[m_dragClipIndex];
        double newStartTime = clip.startTime() + dt;
        if (newStartTime >= 0) {
            clip.setStartTime(newStartTime);
            m_lastMousePos = event->pos();
            emit timelineChanged();
            update();
        }
    }
}

void Timeline::mouseReleaseEvent(QMouseEvent *event)
{
    if (event->button() == Qt::LeftButton) {
        m_isDragging = false;
        m_isResizing = false;
        m_dragClipIndex = -1;
    }
}

int Timeline::getClipAtPosition(const QPoint &pos)
{
    int rulerHeight = 30;
    if (pos.y() < rulerHeight + 10) {
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
    return pixel / m_pixelsPerSecond;
}

int Timeline::timeToPixel(double time) const
{
    return static_cast<int>(time * m_pixelsPerSecond);
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
        double duration = 5.0; // Default duration, should be detected from file
        addClip(fileName, startTime, duration);
    }
}

void Timeline::onRemoveClipClicked()
{
    if (m_selectedClipIndex >= 0) {
        removeClip(m_selectedClipIndex);
    }
}
