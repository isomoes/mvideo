#include "Clip.h"

Clip::Clip()
    : m_startTime(0.0)
    , m_duration(0.0)
    , m_trimStart(0.0)
    , m_trimEnd(0.0)
{
}

Clip::Clip(const QString &filePath, double startTime, double duration)
    : m_filePath(filePath)
    , m_startTime(startTime)
    , m_duration(duration)
    , m_trimStart(0.0)
    , m_trimEnd(0.0)
{
}
