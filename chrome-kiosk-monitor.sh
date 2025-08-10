#!/bin/bash

check_display() {
    local DISPLAY_ID=$1
    export DISPLAY=$DISPLAY_ID

    echo "Checking Chrome windows on DISPLAY=$DISPLAY_ID..."

    if ! xdpyinfo >/dev/null 2>&1; then
        echo "Cannot access DISPLAY=$DISPLAY_ID. Skipping..."
        return
    fi

    chrome_windows=$(wmctrl -lx | grep -i "google-chrome.Google-chrome")

    if [ -z "$chrome_windows" ]; then
        echo "No Chrome windows found on $DISPLAY_ID. Launching Chrome in kiosk mode..."
        google-chrome --no-sandbox --kiosk --user-data-dir=/tmp/kiosk-$DISPLAY_ID &
        sleep 10
        return
    fi

    echo "Checking Chrome window states on $DISPLAY_ID..."
    while read -r line; do
        win_id=$(echo "$line" | awk '{print $1}')
        echo "Inspecting window $win_id..."

        if xprop -id "$win_id" | grep -q '_NET_WM_STATE_FULLSCREEN'; then
            echo "Window $win_id is already fullscreen. Skipping..."
        else
            echo "Window $win_id is not fullscreen. Sending F11..."
            xdotool windowactivate "$win_id"
            sleep 0.5
            xdotool key --window "$win_id" F11
            echo "Fullscreen toggled for window $win_id."
        fi
    done <<< "$chrome_windows"
}

# Run once for all active displays
active_displays=$(ls /tmp/.X11-unix | sed 's/X/:/')
for display in $active_displays; do
    check_display "$display"
done
