#ifndef MPVVIDEOWIDGET_H
#define MPVVIDEOWIDGET_H

#include <QOpenGLWidget>
#include <QOpenGLFunctions>
#include <mpv/client.h>
#include <mpv/render.h>

class MpvVideoWidget : public QOpenGLWidget, protected QOpenGLFunctions
{
    Q_OBJECT

public:
    explicit MpvVideoWidget(QWidget *parent = nullptr);
    ~MpvVideoWidget() override;

    void setMpv(mpv_handle *handle);
    void shutdown();

protected:
    void initializeGL() override;
    void paintGL() override;
    void resizeGL(int w, int h) override;

private:
    mpv_handle *mpv;
    mpv_render_context *mpvGl;

    static void *getProcAddress(void *ctx, const char *name);
    static void onMpvUpdate(void *ctx);
    void initRenderContext();
};

#endif // MPVVIDEOWIDGET_H
