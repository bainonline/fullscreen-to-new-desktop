function log(msg) {
    print("KWinMax2NewVirtualDesktop: " + msg);
}

function findDesktop(name) {
    log("Trying to find " + name + " " + workspace.desktops);
    for (i = 0; i < workspace.desktops.length; i++) {
        desktop = workspace.desktops[i];
        if (desktop.name == name) {
            log("Found :" + desktop.name);
            return desktop;
        }
    }
}

const savedDesktops = {};

function getNextDesktopNumber() {
    log("Trying to find next desktop number " + workspace.currentDesktop);
    for (i = 0; i < workspace.desktops.length; i++) {
        desktop = workspace.desktops[i];
        log(desktop, workspace.currentDesktop);
        if (desktop == workspace.currentDesktop) {
            log("Found :" + desktop.name + " Number : " + i);
            return i + 1;
        }
    }
}

function moveToNewDesktop(window) {
    log("Creating new desktop with name : " | window.internalId.toString());
    let newDesktopNumber = getNextDesktopNumber();

    workspace.createDesktop(newDesktopNumber, window.internalId.toString());

    newDesktop = findDesktop(window.internalId.toString());

    savedDesktops[window.internalId.toString()] = workspace.currentDesktop;
    ds = [newDesktop]
    window.desktops = ds
    workspace.currentDesktop = newDesktop;
}

function restoreDesktop(window) {
    log("Restoring desktop for " + window.internalId);
    if (window.desktops[0].name == window.internalId.toString()) {
        log("here")
        let currentDesktop = window.desktops[0];
        log(currentDesktop);
        if (savedDesktops.hasOwnProperty(window.internalId.toString())) {
            let desktops = [savedDesktops[window.internalId.toString()]]
            delete savedDesktops[window.internalId.toString()]
            window.desktops = desktops;
        }
        workspace.removeDesktop(currentDesktop);
        workspace.currentDesktop = window.desktops[0];
    }
}

function fullScreenChanged(window) {
    log("Window : " + window.internalId.toString() + " fullscreen : " + window.fullScreen);

    if (window.fullScreen) {
        moveToNewDesktop(window);
    } else {
        restoreDesktop(window);
    }
}


function install() {
    log("Installing handler for workspace window add");
    workspace.windowAdded.connect(window => {
        // Check if the window is normal and fullscreenable
        if(window.normalWindow && window.fullScreenable){
            log("Installing fullscreen and close handles for" + window.internalId.toString());
            window.fullScreenChanged.connect(function () {
                log(window.internalId.toString() + "fullscreen changed");
                fullScreenChanged(window);
            });
            window.closed.connect(function () {
                log(window.internalId.toString() + " closed");
                restoreDesktop(window);
            });
        }
    });
    log("Workspacke handler installed");
}


log("Initializing...");
install();
