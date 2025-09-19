//
// Copyright (c) 2022-2024 Winlin
//
// SPDX-License-Identifier: MIT
//

package main

import (
	"os"
	"runtime"
)

// KillProcess terminates a process in a cross-platform way
func KillProcess(pid int) error {
	if runtime.GOOS == "windows" {
		// On Windows, find the process and kill it
		if proc, err := os.FindProcess(pid); err != nil {
			return err
		} else {
			return proc.Kill()
		}
	} else {
		// On Unix systems, use os.FindProcess which works cross-platform
		if proc, err := os.FindProcess(pid); err != nil {
			return err
		} else {
			return proc.Kill()
		}
	}
}
