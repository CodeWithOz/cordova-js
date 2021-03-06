/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var modulemapper = require('cordova/modulemapper');

// Helper function to inject a <script> tag.
// Exported for testing.
exports.injectScript = function (url, onload, onerror, retNode) {
    var script = document.createElement('script');
    if (retNode) {
        // only do this if the node will be appended to a document fragment
        script.defer = true;
    }
    // onload fires even when script fails loads with an error.
    script.onload = onload;
    // onerror fires for malformed URLs.
    script.onerror = onerror;
    script.src = url;
    if (retNode) {
        return script;
    } else {
        document.head.appendChild(script);
    }
};

function injectIfNecessary (id, url, onload, onerror, retNode) {
    onerror = onerror || onload;
    if (id in define.moduleMap) {
        onload();
    } else {
        const node = exports.injectScript(url, function () {
            if (id in define.moduleMap) {
                onload();
            } else {
                onerror();
            }
        }, onerror, retNode);
        if (retNode) return node;
    }
}

function onScriptLoadingComplete (moduleList, finishPluginLoading) {
    // Loop through all the plugins and then through their clobbers and merges.
    for (var i = 0, module; (module = moduleList[i]); i++) {
        if (module.clobbers && module.clobbers.length) {
            for (var j = 0; j < module.clobbers.length; j++) {
                modulemapper.clobbers(module.id, module.clobbers[j]);
            }
        }

        if (module.merges && module.merges.length) {
            for (var k = 0; k < module.merges.length; k++) {
                modulemapper.merges(module.id, module.merges[k]);
            }
        }

        // Finally, if runs is truthy we want to simply require() the module.
        if (module.runs) {
            modulemapper.runs(module.id);
        }
    }

    finishPluginLoading();
}

// Handler for the cordova_plugins.js content.
// See plugman's plugin_loader.js for the details of this object.
// This function is only called if the really is a plugins array that isn't empty.
// Otherwise the onerror response handler will just call finishPluginLoading().
function handlePluginsObject (path, moduleList, finishPluginLoading) {
    // Now inject the scripts.
    var scriptCounter = moduleList.length;

    if (!scriptCounter) {
        finishPluginLoading();
        return;
    }
    function scriptLoadedCallback () {
        if (!--scriptCounter) {
            onScriptLoadingComplete(moduleList, finishPluginLoading);
        }
    }

    const frag = document.createDocumentFragment();
    const pluginsToDelay = {
        "cordova-plugin-background-fetch.BackgroundFetch": "cordova-plugin-background-fetch.BackgroundFetch",
        "cordova-background-geolocation.BackgroundGeolocation": "cordova-background-geolocation.BackgroundGeolocation",
        "cordova-background-geolocation.API": "cordova-background-geolocation.API",
        "cordova-background-geolocation.DeviceSettings": "cordova-background-geolocation.DeviceSettings",
        "cordova-background-geolocation.Logger": "cordova-background-geolocation.Logger",
        "cordova-background-geolocation.TransistorAuthorizationToken": "cordova-background-geolocation.TransistorAuthorizationToken",
        "cordova-plugin-file.DirectoryEntry": "cordova-plugin-file.DirectoryEntry",
        "cordova-plugin-file.DirectoryReader": "cordova-plugin-file.DirectoryReader",
        "cordova-plugin-file.Entry": "cordova-plugin-file.Entry",
        "cordova-plugin-file.File": "cordova-plugin-file.File",
        "cordova-plugin-file.FileEntry": "cordova-plugin-file.FileEntry",
        "cordova-plugin-file.FileError": "cordova-plugin-file.FileError",
        "cordova-plugin-file.FileReader": "cordova-plugin-file.FileReader",
        "cordova-plugin-file.FileSystem": "cordova-plugin-file.FileSystem",
        "cordova-plugin-file.FileUploadOptions": "cordova-plugin-file.FileUploadOptions",
        "cordova-plugin-file.FileUploadResult": "cordova-plugin-file.FileUploadResult",
        "cordova-plugin-file.FileWriter": "cordova-plugin-file.FileWriter",
        "cordova-plugin-file.Flags": "cordova-plugin-file.Flags",
        "cordova-plugin-file.LocalFileSystem": "cordova-plugin-file.LocalFileSystem",
        "cordova-plugin-file.Metadata": "cordova-plugin-file.Metadata",
        "cordova-plugin-file.ProgressEvent": "cordova-plugin-file.ProgressEvent",
        "cordova-plugin-file.fileSystems": "cordova-plugin-file.fileSystems",
        "cordova-plugin-file.requestFileSystem": "cordova-plugin-file.requestFileSystem",
        "cordova-plugin-file.resolveLocalFileSystemURI": "cordova-plugin-file.resolveLocalFileSystemURI",
        "cordova-plugin-file.isChrome": "cordova-plugin-file.isChrome",
        "cordova-plugin-file.androidFileSystem": "cordova-plugin-file.androidFileSystem",
        "cordova-plugin-file.fileSystems-roots": "cordova-plugin-file.fileSystems-roots",
        "cordova-plugin-file.fileSystemPaths": "cordova-plugin-file.fileSystemPaths",
        "cordova-plugin-file-transfer.FileTransferError": "cordova-plugin-file-transfer.FileTransferError",
        "cordova-plugin-file-transfer.FileTransfer": "cordova-plugin-file-transfer.FileTransfer",
        "cordova-plugin-googlemaps.Promise": "cordova-plugin-googlemaps.Promise",
        "cordova-plugin-googlemaps.BaseClass": "cordova-plugin-googlemaps.BaseClass",
        "cordova-plugin-googlemaps.BaseArrayClass": "cordova-plugin-googlemaps.BaseArrayClass",
        "cordova-plugin-googlemaps.LatLng": "cordova-plugin-googlemaps.LatLng",
        "cordova-plugin-googlemaps.LatLngBounds": "cordova-plugin-googlemaps.LatLngBounds",
        "cordova-plugin-googlemaps.VisibleRegion": "cordova-plugin-googlemaps.VisibleRegion",
        "cordova-plugin-googlemaps.Location": "cordova-plugin-googlemaps.Location",
        "cordova-plugin-googlemaps.CameraPosition": "cordova-plugin-googlemaps.CameraPosition",
        "cordova-plugin-googlemaps.Polyline": "cordova-plugin-googlemaps.Polyline",
        "cordova-plugin-googlemaps.Polygon": "cordova-plugin-googlemaps.Polygon",
        "cordova-plugin-googlemaps.Marker": "cordova-plugin-googlemaps.Marker",
        "cordova-plugin-googlemaps.HtmlInfoWindow": "cordova-plugin-googlemaps.HtmlInfoWindow",
        "cordova-plugin-googlemaps.Circle": "cordova-plugin-googlemaps.Circle",
        "cordova-plugin-googlemaps.TileOverlay": "cordova-plugin-googlemaps.TileOverlay",
        "cordova-plugin-googlemaps.GroundOverlay": "cordova-plugin-googlemaps.GroundOverlay",
        "cordova-plugin-googlemaps.Common": "cordova-plugin-googlemaps.Common",
        "cordova-plugin-googlemaps.encoding": "cordova-plugin-googlemaps.encoding",
        "cordova-plugin-googlemaps.spherical": "cordova-plugin-googlemaps.spherical",
        "cordova-plugin-googlemaps.poly": "cordova-plugin-googlemaps.poly",
        "cordova-plugin-googlemaps.Geocoder": "cordova-plugin-googlemaps.Geocoder",
        "cordova-plugin-googlemaps.LocationService": "cordova-plugin-googlemaps.LocationService",
        "cordova-plugin-googlemaps.Map": "cordova-plugin-googlemaps.Map",
        "cordova-plugin-googlemaps.event": "cordova-plugin-googlemaps.event",
        "cordova-plugin-googlemaps.MapTypeId": "cordova-plugin-googlemaps.MapTypeId",
        "cordova-plugin-googlemaps.KmlOverlay": "cordova-plugin-googlemaps.KmlOverlay",
        "cordova-plugin-googlemaps.KmlLoader": "cordova-plugin-googlemaps.KmlLoader",
        "cordova-plugin-googlemaps.Environment": "cordova-plugin-googlemaps.Environment",
        "cordova-plugin-googlemaps.MarkerCluster": "cordova-plugin-googlemaps.MarkerCluster",
        "cordova-plugin-googlemaps.Cluster": "cordova-plugin-googlemaps.Cluster",
        "cordova-plugin-googlemaps.geomodel": "cordova-plugin-googlemaps.geomodel",
        "cordova-plugin-googlemaps.commandQueueExecutor": "cordova-plugin-googlemaps.commandQueueExecutor",
        "cordova-plugin-googlemaps.pluginInit": "cordova-plugin-googlemaps.pluginInit",
        "cordova-plugin-googlemaps.StreetViewPanorama": "cordova-plugin-googlemaps.StreetViewPanorama",
        "cordova-plugin-googlemaps.Overlay": "cordova-plugin-googlemaps.Overlay",
        "cordova-plugin-googlemaps.Thread": "cordova-plugin-googlemaps.Thread",
        "cordova-plugin-googlemaps.InlineWorker": "cordova-plugin-googlemaps.InlineWorker",
        "cordova-plugin-googlemaps.googlemaps-cdv-plugin": "cordova-plugin-googlemaps.googlemaps-cdv-plugin",
        "cordova-plugin-googlemaps.js_CordovaGoogleMaps": "cordova-plugin-googlemaps.js_CordovaGoogleMaps",
    };
    for (var i = 0; i < moduleList.length; i++) {
        const moduleId = moduleList[i].id;
        const script = injectIfNecessary(moduleId, path + moduleList[i].file, scriptLoadedCallback, undefined, true);
        if (script instanceof HTMLScriptElement) {
            if (!pluginsToDelay[moduleId]) {
                // do not lazyload this script
                script.defer = false;
            }
            frag.appendChild(script);
        }
    }
    requestAnimationFrame(function() {
        document.head.appendChild(frag);
    });
}

function findCordovaPath () {
    var path = null;
    var scripts = document.getElementsByTagName('script');
    var term = '/cordova.js';
    for (var n = scripts.length - 1; n > -1; n--) {
        var src = scripts[n].src.replace(/\?.*$/, ''); // Strip any query param (CB-6007).
        if (src.indexOf(term) === (src.length - term.length)) {
            path = src.substring(0, src.length - term.length) + '/';
            break;
        }
    }
    return path;
}

// Tries to load all plugins' js-modules.
// This is an async process, but onDeviceReady is blocked on onPluginsReady.
// onPluginsReady is fired when there are no plugins to load, or they are all done.
exports.load = function (callback) {
    var pathPrefix = findCordovaPath();
    if (pathPrefix === null) {
        console.log('Could not find cordova.js script tag. Plugin loading may fail.');
        pathPrefix = '';
    }
    injectIfNecessary('cordova/plugin_list', pathPrefix + 'cordova_plugins.js', function () {
        var moduleList = require('cordova/plugin_list');
        handlePluginsObject(pathPrefix, moduleList, callback);
    }, callback);
};
