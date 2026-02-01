#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QVector>
#include <QString>
#include <mpv/client.h>

class QSlider;
class QToolButton;
class QTimer;
class Timeline;

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void openFile();
    void playPause();
    void updatePosition();
    void beginSeek();
    void endSeek();
    void onClipSelected(int index);
    void onTimelineChanged();

private:
    struct TimelineSegment {
        QString source;
        double timelineStart;
        double duration;
        double trimStart;
        bool isGap;
    };

    mpv_handle *mpv;
    QWidget *videoContainer;
    QToolButton *playPauseButton;
    QSlider *seekSlider;
    QTimer *positionTimer;
    bool userSeeking;
    double mediaDuration;
    Timeline *timeline;
    QVector<TimelineSegment> timelineSegments;
    bool usingTimelinePlaylist;
    double currentTimelinePos;
    
    void initializeMpv();
    void setupUI();
    void updatePlayButton(bool isPlaying);
    void rebuildTimelinePlaylist(bool preservePosition);
    void seekToTimelineTime(double timelineTime);
    bool timelinePositionForMpv(double &timelinePos) const;
    bool segmentForTimelineTime(double timelineTime, int &index, double &localPos) const;
};

#endif // MAINWINDOW_H
