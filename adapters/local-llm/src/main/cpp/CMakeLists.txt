cmake_minimum_required(VERSION 3.31.6)
project("agora_llama" LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED true)

# 저장소의 third_party/llama.cpp (git submodule, 커밋 고정)
set(LLAMA_SRC ${CMAKE_CURRENT_LIST_DIR}/../../../../../third_party/llama.cpp)
if(NOT EXISTS ${LLAMA_SRC}/CMakeLists.txt)
    message(FATAL_ERROR "llama.cpp 소스가 없다: git submodule update --init --depth 1 third_party/llama.cpp")
endif()
add_subdirectory(${LLAMA_SRC} build-llama)

add_library(agora_llama SHARED agora_llama.cpp)
target_link_libraries(agora_llama llama llama-common android log)
