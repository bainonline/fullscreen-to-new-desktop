function log(msg) {
    print("KWinMax2NewVirtualDesktop: " + msg);
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

    newDesktop = workspace.desktops[newDesktopNumber];;

    savedDesktops[window.internalId.toString()] = window.desktops;
    ds = [newDesktop]
    window.desktops = ds
    workspace.currentDesktop = newDesktop;
}

function sanitizeDesktops(desktops) {
    log("Sanitizing desktops: " + JSON.stringify(desktops))
    let sanitizedDesktops = desktops.filter(value => Object.keys(value).length !== 0);
    log("Sanitized Desktops: " + JSON.stringify(sanitizedDesktops))
    if (sanitizedDesktops.length < 1) {
        sanitizedDesktops = [workspace.desktops[0]];
    }
    return sanitizedDesktops
}

function restoreDesktop(window) {
    log("Restoring desktop for " + window.internalId);
    if (window.desktops[0].name == window.internalId.toString()) {
        log("here")
        let currentDesktop = window.desktops[0];
        log(currentDesktop);
         if (window.internalId.toString() in savedDesktops ) {
            log("Found saved desktops for: " + window.internalId.toString())
            let desktops = sanitizeDesktops(savedDesktops[window.internalId.toString()])
            delete savedDesktops[window.internalId.toString()]
            window.desktops = desktops;
            workspace.removeDesktop(currentDesktop);
            workspace.currentDesktop = window.desktops[0];
            workspace.raiseWindow(window);
        } else {
            log("Nothng to restore");
        }
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
