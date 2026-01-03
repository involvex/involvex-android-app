cmake_minimum_required(VERSION 3.18.1)

# React Native CMake configuration to address Windows MAX_PATH limitations
# This configuration shortens object file directories to prevent path length issues

# Project name (kept short to minimize path lengths)
project(rn_cmake_short)

# Override default output directories to shorter paths
# This is the key configuration to address Windows 260 character limit
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/obj)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)  
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

# Set shorter C++ flags for release builds
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -frtti -fexceptions")

# Optimization flags for RelWithDebInfo
if(CMAKE_BUILD_TYPE STREQUAL "RelWithDebInfo")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O2 -DNDEBUG")
    message(STATUS "Configuring for RelWithDebInfo with optimizations")
endif()

# Debug configuration
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O0 -g")
    message(STATUS "Configuring for Debug build")
endif()

# Add common React Native libraries that might be needed
# These are examples - adjust based on your actual native dependencies

# Example library configuration (uncomment if needed)
# add_library(rn_modules SHARED
#     dummy.cpp
# )
# 
# target_link_libraries(rn_modules
#     log
#     fbjni
#     react_codegen_rncore
# )

# Log configuration for debugging
message(STATUS "CMake Binary Directory: ${CMAKE_BINARY_DIR}")
message(STATUS "CMake Current Source Directory: ${CMAKE_CURRENT_SOURCE_DIR}")
message(STATUS "Build Type: ${CMAKE_BUILD_TYPE}")
message(STATUS "C++ Flags: ${CMAKE_CXX_FLAGS}")

# Print final output directory configuration for verification
message(STATUS "Archive Output Directory: ${CMAKE_ARCHIVE_OUTPUT_DIRECTORY}")
message(STATUS "Library Output Directory: ${CMAKE_LIBRARY_OUTPUT_DIRECTORY}")
message(STATUS "Runtime Output Directory: ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}")