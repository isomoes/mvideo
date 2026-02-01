#ifndef TIMELINE_H
#define TIMELINE_H

#include <QWidget>
#include <QVector>
#include <QPushButton>
#include "Clip.h"

// Forward declaration for mpv
struct mpv_handle;

class Timeline : public QWidget
{
    Q_OBJECT

public:
    explicit Timeline(QWidget *parent = nullptr);
    ~Timeline();
    
    // Clip management
    void addClip(const QString &filePath, double startTime, double duration);
    void removeClip(int index);
    void clearClips();
    
    // Get clips
    const QVector<Clip>& clips() const { return m_clips; }
    
    // Timeline properties
    double totalDuration() const;
    
    // Playhead control
    void setPlayheadPosition(double time);
    double playheadPosition() const { return m_playheadPosition; }
    
signals:
    void clipAdded(int index);
    void clipRemoved(int index);
    void clipSelected(int index);
    void timelineChanged();
    void playheadMoved(double time);
    
protected:
    void paintEvent(QPaintEvent *event) override;
    void mousePressEvent(QMouseEvent *event) override;
    void mouseMoveEvent(QMouseEvent *event) override;
    void mouseReleaseEvent(QMouseEvent *event) override;
    void wheelEvent(QWheelEvent *event) override;
    
private slots:
    void onAddClipClicked();
    void onRemoveClipClicked();
    
private:
    QVector<Clip> m_clips;
    int m_selectedClipIndex;
    double m_pixelsPerSecond;
    double m_scrollOffset;
    double m_playheadPosition;
    
    // UI elements
    QPushButton *m_addClipButton;
    QPushButton *m_removeClipButton;
    
    // Mouse interaction
    bool m_isDragging;
    bool m_isResizing;
    bool m_isPanning;
    int m_dragClipIndex;
    QPoint m_lastMousePos;
    
    // Helper methods
    void setupUI();
    int getClipAtPosition(const QPoint &pos);
    void drawClip(QPainter &painter, const Clip &clip, int index);
    double pixelToTime(int pixel) const;
    int timeToPixel(double time) const;
    double getVideoDuration(const QString &filePath) const;
};

#endif // TIMELINE_H
