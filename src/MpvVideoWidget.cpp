#include "MpvVideoWidget.h"
#include <QOpenGLContext>
#include <QMetaObject>
#include <QDebug>
#include <mpv/render_gl.h>

MpvVideoWidget::MpvVideoWidget(QWidget *parent)
    : QOpenGLWidget(parent)
    , mpv(nullptr)
    , mpvGl(nullptr)
{
    setUpdateBehavior(QOpenGLWidget::NoPartialUpdate);
}

MpvVideoWidget::~MpvVideoWidget()
{
    shutdown();
}

void MpvVideoWidget::setMpv(mpv_handle *handle)
{
    mpv = handle;
    if (mpv && context() && !mpvGl) {
        initRenderContext();
    }
}

void MpvVideoWidget::shutdown()
{
    if (mpvGl) {
        mpv_render_context_free(mpvGl);
        mpvGl = nullptr;
    }
    mpv = nullptr;
}

void MpvVideoWidget::initializeGL()
{
    initializeOpenGLFunctions();
    if (mpv && !mpvGl) {
        initRenderContext();
    }
}

void MpvVideoWidget::paintGL()
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

void MpvVideoWidget::resizeGL(int w, int h)
{
    Q_UNUSED(w);
    Q_UNUSED(h);
    update();
}

void *MpvVideoWidget::getProcAddress(void *ctx, const char *name)
{
    Q_UNUSED(ctx);
    QOpenGLContext *glctx = QOpenGLContext::currentContext();
    if (!glctx) {
        return nullptr;
    }
    return reinterpret_cast<void *>(glctx->getProcAddress(QByteArray(name)));
}

void MpvVideoWidget::onMpvUpdate(void *ctx)
{
    MpvVideoWidget *self = static_cast<MpvVideoWidget *>(ctx);
    QMetaObject::invokeMethod(self, "update", Qt::QueuedConnection);
}

void MpvVideoWidget::initRenderContext()
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
