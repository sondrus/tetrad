.PHONY: debug run build release start front deps liveserver crossbuild_linux crossbuild_macos crossbuild_windows crossbuild_android crossbuild clean all 

BACKEND_DIR=backend
FRONTEND_DIR=frontend
APP=tetrad
BUILD_DIR=../build/
RELEASE_DIR=../release/

# App version
VERSION := $(shell git describe --tags --abbrev=0 | sed 's/^v//')

# For Android
NDK := /opt/android-ndk
API := 21
TOOLCHAIN := $(NDK)/toolchains/llvm/prebuilt/linux-x86_64
CC := $(TOOLCHAIN)/bin/aarch64-linux-android$(API)-clang
CGO_CFLAGS := --sysroot=$(TOOLCHAIN)/sysroot
CGO_LDFLAGS := --sysroot=$(TOOLCHAIN)/sysroot

debug: front build start

run:
	cd $(BACKEND_DIR) && go run main.go

build: version
	cd $(BACKEND_DIR) && go build -gcflags="all=-N -l" -o $(BUILD_DIR)$(APP).debug main.go

start:
	cd $(BACKEND_DIR) && $(BUILD_DIR)$(APP).debug --host 0.0.0.0 --port 8888 --database ../demo.db

release: version front
	cd $(BACKEND_DIR) && go build -ldflags="-s -w" -o $(BUILD_DIR)$(APP).release main.go
	cd $(BACKEND_DIR) && upx -q -q -q --best --lzma $(BUILD_DIR)$(APP).release || true
	cd $(BACKEND_DIR) && $(BUILD_DIR)$(APP).release

version:
	@printf "package meta\n\n// Version - Application version\nvar Version = \"%s\"\n" $$(git describe --tags --abbrev=0 | sed 's/^v//') > ./backend/meta/version.go

front:
	@cd $(FRONTEND_DIR) && find src public index.html package.json vite.config.ts -type f -print0 | sort -z | xargs -0 sha1sum > .build.hash
	@cd $(FRONTEND_DIR) && \
		if cmp -s .build.hash .build.hash.prev; then \
			echo "frontend: no changes, skipping build"; \
		else \
			echo "Frontend: Changes detected, building..."; \
			echo "cd $(FRONTEND_DIR) && npm run build"; \
			cp LICENSE ../$(BACKEND_DIR)/static/files/about/license.txt; \
			npm run build && cp .build.hash .build.hash.prev; \
		fi

deps:
	cd $(BACKEND_DIR) && go mod tidy
	cd $(FRONTEND_DIR) && npm install -g npm-run-all && npm install

liveserver:
	cd $(FRONTEND_DIR) && npm run dev

crossbuild_linux: version front
	@# 386
	cd $(BACKEND_DIR) && GOOS=linux GOARCH=386 \
		go build -ldflags="-s -w" -o ../release/$(APP)_linux_386 main.go && \
		cd .. && \
		upx -q -q -q --best --lzma release/$(APP)_linux_386 || true && \
		tar -czf release/$(APP)_$(VERSION)_linux_386.tar.gz README.MD LICENSE -C release $(APP)_linux_386 && \
		rm release/$(APP)_linux_386


	@# amd64
	cd $(BACKEND_DIR) && GOOS=linux GOARCH=amd64 \
		go build -ldflags="-s -w" -o ../release/$(APP)_linux_amd64 main.go && \
		cd .. && \
		upx -q -q -q --best --lzma release/$(APP)_linux_amd64 || true && \
		tar -czf release/$(APP)_$(VERSION)_linux_amd64.tar.gz README.MD LICENSE -C release $(APP)_linux_amd64 && \
		rm release/$(APP)_linux_amd64

	@# arm64
	cd $(BACKEND_DIR) && GOOS=linux GOARCH=arm64 \
		go build -ldflags="-s -w" -o ../release/$(APP)_linux_arm64 main.go && \
		cd .. && \
		tar -czf release/$(APP)_$(VERSION)_linux_arm64.tar.gz README.MD LICENSE -C release $(APP)_linux_arm64 && \
		rm release/$(APP)_linux_arm64

crossbuild_macos: version front
	@# amd64
	cd $(BACKEND_DIR) && GOOS=darwin GOARCH=amd64  \
		go build -ldflags="-s -w" -o ../release/$(APP)_macos_amd64 main.go && \
		cd .. && \
		tar -czf release/$(APP)_$(VERSION)_macos_amd64.tar.gz README.MD LICENSE -C release $(APP)_macos_amd64 && \
		rm release/$(APP)_macos_amd64

	@# arm64
	cd $(BACKEND_DIR) && GOOS=darwin GOARCH=arm64  \
		go build -ldflags="-s -w" -o ../release/$(APP)_macos_arm64 main.go && \
		cd .. && \
		tar -czf release/$(APP)_$(VERSION)_macos_arm64.tar.gz README.MD LICENSE -C release $(APP)_macos_arm64 && \
		rm release/$(APP)_macos_arm64

crossbuild_windows: version front
	@# amd64
	cd $(BACKEND_DIR) && GOOS=windows GOARCH=amd64  CGO_ENABLED=1 CC=x86_64-w64-mingw32-gcc \
		go build -ldflags="-s -w -H windowsgui" -o ../release/$(APP)_win_amd64.exe main.go && \
		cd .. && \
		upx -q -q -q --best --lzma release/$(APP)_win_amd64.exe || true && \
		zip -9 -q -j release/$(APP)_$(VERSION)_win_amd64.zip README.MD LICENSE release/$(APP)_win_amd64.exe && \
		rm release/$(APP)_win_amd64.exe

	@# 386
	cd $(BACKEND_DIR) && GOOS=windows GOARCH=386 CGO_ENABLED=1 CC=i686-w64-mingw32-gcc \
		go build -ldflags="-s -w -H windowsgui" -o ../release/$(APP)_win_386.exe main.go && \
		cd .. && \
		upx -q -q -q --best --lzma release/$(APP)_win_386.exe || true && \
		zip -9 -q -j release/$(APP)_$(VERSION)_win_386.zip README.MD LICENSE release/$(APP)_win_386.exe && \
		rm release/$(APP)_win_386.exe

	@# arm64
	cd $(BACKEND_DIR) && GOOS=windows GOARCH=arm64  \
		go build -ldflags="-s -w -H windowsgui" -o ../release/$(APP)_win_arm64.exe main.go && \
		cd .. && \
		zip -9 -q -j release/$(APP)_$(VERSION)_win_arm64.zip README.MD LICENSE release/$(APP)_win_arm64.exe && \
		rm release/$(APP)_win_arm64.exe

crossbuild_android: version front
	@# arm64
	cd $(BACKEND_DIR) && \
		export NDK=$(NDK) && \
		export API=$(API) && \
		export TOOLCHAIN=$(TOOLCHAIN) && \
		export CC=$(CC) && \
		export CGO_CFLAGS="$(CGO_CFLAGS)" && \
		export CGO_LDFLAGS="$(CGO_LDFLAGS)" && \
		GOOS=android GOARCH=arm64 CGO_ENABLED=1 CC=$$CC \
		go build -ldflags="-s -w" -o ../release/$(APP)_android_arm64 main.go && \
		cd .. && \
		zip -9 -q -j release/$(APP)_$(VERSION)_android_arm64.zip README.MD LICENSE release/$(APP)_android_arm64 && \
		rm release/$(APP)_android_arm64

crossbuild: clean front crossbuild_linux crossbuild_macos crossbuild_windows crossbuild_android

clean:
	rm -rf ./release/*

all: deps build release
