cmake_minimum_required(VERSION 3.31.6)
project("agora_llama" LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED true)

# 저장소의 third_party/llama.cpp (git submodule, 커밋 고정)
set(LLAMA_SRC ${CMAKE_CURRENT_LIST_DIR}/../../../../../third_party/llama.cpp)
if(NOT EXISTS ${LLAMA_SRC}/CMakeLists.txt)
    message(FATAL_ERROR "llama.cpp 소스가 없다: git submodule update --init --depth 1 third_party/llama.cpp")
endif()
if(ANDROID_ABI STREQUAL "arm64-v8a")
    # 휴대폰 칩에 맞는 CPU 판을 실행 중에 고른다(llama.cpp 공식 방식, examples/llama.android와 같음).
    # 판마다 libggml-cpu-android_*.so 가 따로 생기고, 시작할 때 이 칩에서 돌 수 있는 것 중 가장 빠른 판을 읽는다.
    # 예: SM8750(Z Fold7)은 i8mm(MATMUL_INT8)이 있는 armv8.6 판 → Q4_0 행렬곱이 빨라져 첫 글자까지 시간이 준다.
    # 예전 칩은 dotprod 판이나 기본 판으로 내려간다 — 한 판(armv8.2+dotprod+fp16)만 넣던 때처럼 꺼지지 않는다.
    set(BUILD_SHARED_LIBS ON CACHE BOOL "" FORCE)
    set(GGML_BACKEND_DL ON CACHE BOOL "" FORCE)
    set(GGML_CPU_ALL_VARIANTS ON CACHE BOOL "" FORCE)
else()
    # 가상 휴대폰(x86_64)은 노트북 CPU 명령어를 그대로 쓴다 — 개발 확인용, 출시 대상 아님
    set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
    set(GGML_AVX ON)
    set(GGML_AVX2 ON)
    set(GGML_FMA ON)
    set(GGML_F16C ON)
endif()
add_subdirectory(${LLAMA_SRC} build-llama)

add_library(agora_llama SHARED agora_llama.cpp)
target_link_libraries(agora_llama llama llama-common android log)
if(GGML_BACKEND_DL)
    # CPU 판(ggml-cpu-android_*)은 링크하지 않는 MODULE이다. 안드로이드 빌드가 모든 대상을 만들어 APK에 넣는다.
    target_compile_definitions(agora_llama PRIVATE AGORA_BACKEND_DL=1)
endif()
