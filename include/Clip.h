#ifndef CLIP_H
#define CLIP_H

#include <QString>

class Clip
{
public:
    Clip(const QString &filePath, double startTime, double duration);
    
    QString filePath() const { return m_filePath; }
    double startTime() const { return m_startTime; }
    double duration() const { return m_duration; }
    double endTime() const { return m_startTime + m_duration; }
    
    void setStartTime(double time) { m_startTime = time; }
    void setDuration(double duration) { m_duration = duration; }
    void setFilePath(const QString &path) { m_filePath = path; }
    
    // Trimming support
    double trimStart() const { return m_trimStart; }
    double trimEnd() const { return m_trimEnd; }
    void setTrimStart(double trim) { m_trimStart = trim; }
    void setTrimEnd(double trim) { m_trimEnd = trim; }
    
private:
    QString m_filePath;
    double m_startTime;  // Position on timeline
    double m_duration;   // Duration of clip
    double m_trimStart;  // Trim from start of source
    double m_trimEnd;    // Trim from end of source
};

#endif // CLIP_H
