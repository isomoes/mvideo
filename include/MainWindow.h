#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
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
    mpv_handle *mpv;
    QWidget *videoContainer;
    QToolButton *playPauseButton;
    QSlider *seekSlider;
    QTimer *positionTimer;
    bool userSeeking;
    double mediaDuration;
    Timeline *timeline;
    
    void initializeMpv();
    void setupUI();
    void updatePlayButton(bool isPlaying);
};

#endif // MAINWINDOW_H
