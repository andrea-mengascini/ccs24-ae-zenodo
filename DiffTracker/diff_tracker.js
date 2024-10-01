let snap;

addEventListener('message', function(event) {
    switch (event.data) {
        case 'snapshotClicked':
            snap = snapshot();
            break;
        case 'removeChangedClicked':
            removeChanged(snap);
            break;
        case 'removeUnchangedClicked':
            removeUnchanged(snap);
            break;
        case 'downloadClicked':
            download();
            break;
    }
});


/**
 *   ____            _         _____                                          _
 *  |  _ \          (_)       / ____|                                        | |
 *  | |_) | __ _ ___ _  ___  | |     ___  _ __ ___  _ __ ___   __ _ _ __   __| |___
 *  |  _ < / _` / __| |/ __| | |    / _ \| '_ ` _ \| '_ ` _ \ / _` | '_ \ / _` / __|
 *  | |_) | (_| \__ \ | (__  | |___| (_) | | | | | | | | | | | (_| | | | | (_| \__ \
 *  |____/ \__,_|___/_|\___|  \_____\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|\__,_|___/
 */

/**
 * Execute one of the following commands to start an observation of an object.
 *
 *     let snap = snapshot([object]);
 *     Example:
 *         let snap = snapshot();
 *         let snap = snapshot(window);
 *
 * These commands generate a snapshot of the given object. By default, this function will capture the window object.
 *
 * After creating a snapshot, two functions can be used to eliminate objects, those are not the focus of observation.
 *
 *     removeChanged(snap_object);
 *     Example:
 *         removeChanged(snap);
 *
 *     removeUnchanged(snap_object);
 *     Example:
 *         removeUnchanged(snap);
 *
 * Both of these functions update the snapshot object automatically. The removeChanged() function should be used to
 * remove objects, which have changed since the previous snapshot update (either from the first snapshot() function
 * execution or any of the remove functions). The removeUnchanged() function removes objects, which have not changed
 * since the previous snapshot update.
 *
 * After reducing the number of the objects, the following command can be used to get the shortest path of the observed
 * path.
 *
 *     getShortestPath(path, snap_object, [log]);
 *     Example:
 *         getShortestPath(snap.paths[42], snap);
 *         getShortestPath(snap.paths[42], snap, 1);
 *
 * Another option would be to use the following command to get the shortest paths from an array of paths.
 *
 *     getShortestPaths(paths, snap_object);
 *     Example:
 *         getShortestPaths(snap.paths, snap);
 */

/**
 *   ______                           _         _____                           _
 *  |  ____|                         | |       / ____|                         (_)
 *  | |__  __  ____ _ _ __ ___  _ __ | | ___  | (___   ___ ___ _ __   __ _ _ __ _  ___
 *  |  __| \ \/ / _` | '_ ` _ \| '_ \| |/ _ \  \___ \ / __/ _ \ '_ \ / _` | '__| |/ _ \
 *  | |____ >  < (_| | | | | | | |_) | |  __/  ____) | (_|  __/ | | | (_| | |  | | (_) |
 *  |______/_/\_\__,_|_| |_| |_| .__/|_|\___| |_____/ \___\___|_| |_|\__,_|_|  |_|\___/
 *                             | |
 *                             |_|
 */

/**
 * 1. Create a snapshot using the following command.
 *
 *     let snap = snapshot();
 *
 * 2. Remove noises of changing objects.
 *
 *     removeChanged(snap);
 *
 * 3. Make change to the observed object via UI.
 * 4. Remove objects that did not change.
 *
 *     removeUnchanged(snap);
 *
 * 5. Repeat steps 3-4 for a few times.
 * 6. Inspect "snap.objects" and "snap.paths" and look for the observed object
 * 7. Get the shortest version of recorded paths.
 *
 *     getShortestPaths(snap.paths, snap);
 *
 * 8. Find the path which contains the observed object.
 */

/**
 *   __  __       _         ______                _   _
 *  |  \/  |     (_)       |  ____|              | | (_)
 *  | \  / | __ _ _ _ __   | |__ _   _ _ __   ___| |_ _  ___  _ __  ___
 *  | |\/| |/ _` | | '_ \  |  __| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
 *  | |  | | (_| | | | | | | |  | |_| | | | | (__| |_| | (_) | | | \__ \
 *  |_|  |_|\__,_|_|_| |_| |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
 */

/**
 * @typedef  {Object}         Snapshot
 * @property {Object}         root          - The root object of the snapshot
 * @property {Set}            allObjects    - "Reference" of all objects
 * @property {Array}          objects       - Serializable cloned objects
 * @property {Array<string>}  paths         - Paths for objects
 * @property {Array<Object>}  savedObjects  - Saved objects for lookup array
 * @property {Array<string>}  savedPaths    - Saved paths for lookup array
 */

/**
 * Save all serializable objects and their paths.
 *
 * This function should only be executed once at the start of observation of an object. This is a recursive function
 * that saves the first serializable object it finds. The function keep tracks of all object it has visited to avoid
 * circular reference.
 *
 * @param   {Object} [obj=window]
 *          The root object to be snapped.
 * @returns {Snapshot}
 *          Saved objects and their paths
 */
const snapshot = function(obj=window) {
    // Time start
    const start = Date.now();

    // Memory for all visited objects. Saved to avoid circular reference
    let allObjects = new Set();

    // Memory for all serializable objects and their paths
    let objects = [];
    let paths = [];

    // Memory for all visited objects and their paths. These are used to create a lookup array to find the shortest path
    let savedObjects = [];
    let savedPaths = [];

    // Recursive function that traverse through the objects and save all the serializable objects it finds
    const snap = function(obj, currPath) {
        // Filter unwanted paths that include certain keywords
        if (!filter(currPath, obj)) return;

        // Save objects for lookup array
        savedObjects.push(obj);
        savedPaths.push(currPath.substring(1));

        // Allow primitive values to have duplicates (e.g., the same string may be contained in 2 different paths)
        if (typeof obj !== 'object' && obj !== "") {
            // Save the serializable object (primitive)
            objects.push(obj);
            paths.push(currPath.substring(1));

            return;
        }

        // Skip visited object to avoid circular reference
        if (allObjects.has(obj)) return;

        // Add to circular reference prevention array
        allObjects.add(obj);

        try {
            // Try to serialize objects
            let objClone = structuredClone(obj);

            // Save the object if it is serializable
            objects.push(objClone);
            paths.push(currPath.substring(1));
        } catch (error) {
            // Traverse through each child node if the current object is not serializable
            for (const key in obj) {
                try {
                    let childObj = obj[key];

                    // Recursive call
                    snap(childObj, currPath + '.' + key);
                } catch {
                    // Can not access object
                }
            }
        }
    }

    // Start taking snapshot
    snap(obj, '');

    // Time end
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
    console.log(`Number of objects: ${paths.length}`);

    return {
        root: obj,
        allObjects: allObjects,
        objects: objects,
        paths: paths,
        savedObjects: savedObjects,
        savedPaths: savedPaths
    };
}

/**
 * Remove the objects and their paths which have not changed since the previous snapshot.
 *
 * This function takes the previous snapshot and compare the previous with the current objects. Every object pair that
 * is equal will be removed. This function also update the snapshot with the current value of the object.
 *
 * @param   {Snapshot} snapshot
 *          A snapshot object that is taken with snapshot() function.
 * @see     snapshot
 */
const removeUnchanged = function(snapshot) {
    // Time start
    const start = Date.now();

    // Iterate through the objects and paths and remove those that have not changed since the previous snapshot
    for (let i = 0, l = snapshot.paths.length; i < l; i++) {
        try {
            // Get the previous and current object
            let prevObject = snapshot.objects[i];
            let currObject = getObjectByPath(snapshot.root, snapshot.paths[i]);

            if (JSON.stringify(prevObject) === JSON.stringify(currObject)) {
                // Mark the objects and paths entry for every unchanged objects
                snapshot.objects[i] = 'TOREMOVE';
                snapshot.paths[i]   = 'TOREMOVE';
            } else {
                // Update the object array with the current value
                snapshot.objects[i] = structuredClone(currObject);
            }
        } catch {
            // Object not found (Object has changed)
        }
    }

    // Removes the marked objects and paths
    snapshot.objects = snapshot.objects.filter(function(e){return e !== 'TOREMOVE'});
    snapshot.paths = snapshot.paths.filter(function(e){return e !== 'TOREMOVE'});

    // Time end
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
    console.log(`Number of objects: ${snapshot.paths.length}`);
}

/**
 * Remove the objects and their paths that have changed since the previous snapshot.
 *
 * This function takes the previous snapshot and compare the previous with the current objects. Every object pair that
 * is not equal will be removed and each node in the object will be checked. Nodes that has not changed will be added to
 * the objects and paths array. This function also update the snapshot with the current value of the object.
 *
 * NOTE: This function may increase the number of objects. This is caused by the node generation algorithm when an
 * object has changed. If an object has changed, the algorithm aims to only remove the child nodes of the objects that
 * have changed. Therefore, it needs to add the unchanged child nodes to the array of objects and paths.
 *
 * For example, we have an array of objects
 *
 *     [a, b, c]
 *
 * where b has changed. The b object has the following structure
 *
 *          b
 *         /|\
 *       /  |  \
 *     b.x b.y b.z
 *
 * and only b.y has changed. Here, we need to remove b from the array and add b.x and b.z to the array. The new array
 * will look like
 *
 *     [a, b.x, b.z, c]
 *
 * It is possible for the array to have more objects than before.
 *
 * @param   {Snapshot} snapshot
 *          A snapshot object that is taken with snapshot() function.
 * @see     snapshot
 */
const removeChanged = function(snapshot) {
    // Time start
    const start = Date.now();

    // Iterate through the objects and paths and remove those that have changed since the previous snapshot
    for (let i = 0, l = snapshot.paths.length; i < l; i++) {
        // Get the previous and current object
        const prevObj = snapshot.objects[i];
        let currObj;
        try {
            currObj = getObjectByPath(snapshot.root, snapshot.paths[i]);
        } catch {
            // Object not found (Object has changed)
            snapshot.objects[i] = 'TOREMOVE';
            snapshot.paths[i] = 'TOREMOVE';

            continue;
        }

        // Continue to the next object if the current object has not changed
        try {
            if (JSON.stringify(prevObj) === JSON.stringify(currObj)) continue;
        } catch {
            // Object is not serializable anymore. Object has changed and therefore removed
        }

        // Only checks if both are objects. Otherwise, the object type has changed. Hence, the whole object has changed
        if (typeof currObj === 'object' && typeof prevObj === 'object') {
            // Add the unchanged nodes to the objects and paths array
            for (const key in prevObj) {
                try {
                    generateNodes(prevObj[key], currObj[key], snapshot.paths[i] + '.' + key, snapshot);
                } catch {
                    // Property missing. Object has changed. Do not add child object to objects and paths array
                }
            }
        }

        // Mark the objects and paths entry for every changed objects
        snapshot.objects[i] = 'TOREMOVE';
        snapshot.paths[i] = 'TOREMOVE';
    }

    // Removes the marked objects and paths
    snapshot.objects = snapshot.objects.filter(function(e){return e !== 'TOREMOVE'});
    snapshot.paths = snapshot.paths.filter(function(e){return e !== 'TOREMOVE'});

    // Time end
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);
    console.log(`Number of objects: ${snapshot.paths.length}`);
}

/**
 *   _    _      _                   ______                _   _
 *  | |  | |    | |                 |  ____|              | | (_)
 *  | |__| | ___| |_ __   ___ _ __  | |__ _   _ _ __   ___| |_ _  ___  _ __  ___
 *  |  __  |/ _ \ | '_ \ / _ \ '__| |  __| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
 *  | |  | |  __/ | |_) |  __/ |    | |  | |_| | | | | (__| |_| | (_) | | | \__ \
 *  |_|  |_|\___|_| .__/ \___|_|    |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
 *                | |
 *                |_|
 */

/**
 * Generate new objects and paths to the snapshot object when removing a changed object.
 *
 * This function visits the child nodes and compare the value between 2 variables. It will add every unchanged nodes to
 * the objects and paths array. This is a helper function for removeChanged() function.
 * @see removeChanged
 *
 * @param   {Object} prevObj
 *          Previous object from the snapshot.
 * @param   {Object} currObj
 *          Current object obtained from the getObjectByPath() function.
 * @param   {string} currPath
 *          The path of both objects.
 * @param   {Snapshot} snapshot
 *          A snapshot object that is taken with snapshot() function.
 * @see     snapshot
 */
const generateNodes = function(prevObj, currObj, currPath, snapshot) {
    // Filter unwanted paths that include certain keywords
    if (!filter(currPath, currObj)) return;

    // Save objects for lookup array
    snapshot.savedObjects.push(currObj);
    snapshot.savedPaths.push(currPath.substring(1));

    // Allow primitive values to have duplicates (e.g., the same string may be contained in 2 different paths)
    if (typeof currObj !== 'object' || typeof prevObj !== 'object') {
        // Add node to the objects and paths array if the object has not changed
        if (prevObj === currObj) {
            snapshot.objects.push(currObj);
            snapshot.paths.push(currPath);
        }

        return;
    }

    // Skip visited object to avoid circular reference
    if (snapshot.allObjects.has(currObj)) return;

    // Add to circular reference prevention array
    snapshot.allObjects.add(currObj);

    try {
        // Stop traverse deeper if the current object has not changed
        if (JSON.stringify(prevObj) === JSON.stringify(currObj)) {
            // Add node to the objects and paths array if the object has not changed
            snapshot.objects.push(structuredClone(currObj));
            snapshot.paths.push(currPath);
        }
        // Traverse through child nodes if the current object has changed
        else for (const key in prevObj) generateNodes(prevObj[key], currObj[key], currPath + '.' + key, snapshot);
    } catch (TypeError) {
        // Object is not serializable anymore. Object has changed. Do not add child object to objects and paths array
    }
}

/**
 *   _    _ _   _ _ _ _   _
 *  | |  | | | (_) (_) | (_)
 *  | |  | | |_ _| |_| |_ _  ___  ___
 *  | |  | | __| | | | __| |/ _ \/ __|
 *  | |__| | |_| | | | |_| |  __/\__ \
 *   \____/ \__|_|_|_|\__|_|\___||___/
 */

/**
 * Filters unwanted paths by excluding keywords.
 *
 * @param   path
 *          Path to be checked.
 * @param   obj
 *          Object to be checked.
 * @returns {boolean}
 *          False if a path match filter. True otherwise.
 */
const filter = function(path, obj) {
    // Avoid TypedArray
    if (ArrayBuffer.isView(obj)) return false;

    // Get the last part of the path
    const last = path.substring(path.lastIndexOf("."));
    return !(
        last === '.child' ||
        last === '.children' ||
        last === '.cssRules' ||
        last === '.dep' ||
        last === '.deps' ||
        last === '.firstChild' ||
        last === '.firstElementChild' ||
        last === '.lastChild' ||
        last === '.lastElementChild' ||
        last === '.nextDep' ||
        last === '.nextElementSibling' ||
        last === '.nextSibling' ||
        last === '.nextSub' ||
        last === '.parent' ||
        last === '.previousElementSibling' ||
        last === '.previousSibling' ||
        last === '.prevDep' ||
        last === '.prevSub' ||
        last === '.sub' ||
        last === '.subs'
    );
}

/**
 * Get the object contained in the path.
 *
 * @param   {Object} [obj=window]
 *          Root object of the path.
 * @param   {string} path
 *          Path to the target object inside the root object.
 * @returns {Object}
 *          Object in the given path
 */
const getObjectByPath = function(obj = window, path) {
    if (path === '') return obj;
    function index(obj, i) {return obj[i]}
    return path.split('.').reduce(index, obj);
}

/**
 * Memory for the shortest path of each object
 */
let objectLookup = [];
let pathLookup = [];

/**
 * Reduce the given path to the shortest form.
 *
 * This function simplify the given path starting from max depth by performing a search of the shortest form of the
 * current object in the snapshot object on each depth.
 *
 * @param   {string} path
 *          Path to be simplified.
 * @param   {Object} snapshot
 *          Snapshot object.
 * @param   {number} [log=0]
 *          Indicator for enabling log.
 * @returns {string}
 *          The shortest form of the given path.
 */
const getShortestPath = function(path, snapshot, log=0) {
    // Create lookup if it has not been created
    if (objectLookup.length === 0) {
        // Get the saved objects and paths from snapshot
        let objects = snapshot.savedObjects;
        let paths = snapshot.savedPaths;

        for (let i = 0, l = paths.length; i < l; i++) {
            let obj = objects[i];

            // Do not reduce primitive paths since it may contain duplicates
            if (typeof obj !== 'object') continue;

            // Add object and path to the lookup array if they have not been added
            let newPath = paths[i];
            if (!objectLookup.includes(obj)) {
                objectLookup.push(obj);
                pathLookup.push(newPath);
                continue;
            }

            // Compare the length of the path if the object already exists in the lookup array
            let index = objectLookup.indexOf(obj);
            let oldPath = pathLookup[index];

            // Get the number of dots (.)
            let oldPathLength = (oldPath.match(/\./g) || []).length;
            let newPathLength = (newPath.match(/\./g) || []).length;

            // Replace the shortest path for the current object if the new path has fewer dots (.)
            if (newPathLength < oldPathLength) pathLookup[index] = newPath;
        }
    }

    // Time start
    const start = Date.now();
    if (log) console.log('Finding shortest path...');

    // Recursive function that tries to reduce the path starting from the most right part
    const reducePath = function(left, right) {
        if (log) console.log(`${left} -> ${right}`);

        // Return the final form if the left string is empty
        if (!left) return right;

        // Get the object using the left path
        let obj = getObjectByPath(snapshot.root, left);

        // Move last part of the path to right if object not found in the lookup array
        if (!objectLookup.includes(obj))
            return reducePath(left.substring(0, left.lastIndexOf('.')),
                left.substring(left.lastIndexOf('.') + 1) + '.' + right);

        // Replace path with the shortest path from the lookup array
        left = pathLookup[objectLookup.indexOf(obj)];

        // Recursive call
        return reducePath(left.substring(0, left.lastIndexOf('.')),
            left.substring(left.lastIndexOf('.') + 1) + '.' + right);
    }

    // Start reducing path
    let r = path;
    try {
        r = reducePath(path, "").slice(0, -1)
    } catch (RangeError) {
        // Maximum call stack
    }

    // Time end
    const end = Date.now();
    if (log) console.log(`Done. Execution time: ${end - start} ms`);

    return r;
}

/**
 * Reduce the given path array to the shortest forms.
 *
 * This function simplify the given path array starting from their max depth by performing a search of the shortest form
 * of the current object in the snapshot object on each depth.
 *
 * @param   {Array<string>} paths
 *          Paths to be simplified.
 * @param   {Object} snapshot
 *          Snapshot object.
 * @param   {number} [log=0]
 *          Indicator for enabling log.
 * @return  {Array <string>}
 *          Return an array of the reduced paths.
 */
const getShortestPaths = function(paths, snapshot, log=0) {
    let reduced = []

    // Perform the path reduction for each path in the array
    for (let i = 0, l = paths.length; i < l; i++) reduced.push(getShortestPath(paths[i], snapshot, log));

    return reduced;
}


function download() {
    function stringify(objects) {
        function escapeCSV(s) {
            s = s.replace(/"/g, '""');
            return /[",;\s\t]/.test(s) ? `"${s}"` : s;
        }

        const unsupported = ['bigint', 'function', 'undefined'];

        return objects.map((obj) =>
            escapeCSV(unsupported.includes(typeof  obj) ? String(obj) : JSON.stringify(obj))
                .replaceAll("\n", "\\n"));
    }
    const zip = rows=>rows[0].map((_,c)=>rows.map(row=>row[c]));

    const objects = stringify(snap.objects);
    const paths = stringify(getShortestPaths(snap.paths, snap));
    const types = snap.objects.map((e) => Object.prototype.toString.call(e));
    const combined = zip([objects, paths, types]);

    let data = "";
    combined.forEach(function(row){
        const dataString = row.join(",");
        data += dataString + "\n";
    })

    let a = document.createElement("a");

    let file = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    a.href = URL.createObjectURL(file);
    a.download = "data.csv";
    a.click();
}
