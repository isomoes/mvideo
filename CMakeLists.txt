cmake_minimum_required(VERSION 3.16)

project(mvideo VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

find_package(Qt6 REQUIRED COMPONENTS Widgets OpenGLWidgets OpenGL)
find_package(PkgConfig REQUIRED)
pkg_check_modules(MPV REQUIRED mpv)

include_directories(include ${MPV_INCLUDE_DIRS})
link_directories(${MPV_LIBRARY_DIRS})

set(SOURCES
    src/main.cpp
    src/MainWindow.cpp
    src/Timeline.cpp
    src/Clip.cpp
)

set(HEADERS
    include/MainWindow.h
    include/Timeline.h
    include/Clip.h
)

add_executable(mvideo ${SOURCES} ${HEADERS})

target_link_libraries(mvideo PRIVATE Qt6::Widgets Qt6::OpenGLWidgets Qt6::OpenGL ${MPV_LIBRARIES})
