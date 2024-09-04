This repository contains DiffTracker, a Chrome extension designed to find javascript objects in the window object in web applications using a diffing algorithm.

## Structure
The repository is structured as follows:
- `DiffTracker/`: Contains the source code of the diffing algorithm extension.

## How to use the extension
The extension is compatible with Chromium-based browsers.
### Installation
1. Download as a `zip` file.
2. Extract the `zip` file.
3. In the Chromium-based browsers, navigate to the `Extensions` setting. In *Chrome*, this can be achieved by clicking the 3 dots button on the top right of the browser > `Extensions` > `Manage Extensions`.
4. Click the `Load unpacked` button.
5. Navigate through the extracted `zip` file and load it.

### Using the Interface
To use the extension, open the popup menu from the extension list. In this menu, we provide three functionalities:
* `Create snapshot`: Creates a snapshot, which is a save of the current state of the metaverse platform. This snapshot includes all JS-readable objects in the platform (e.g., The position and rotation of all players, and the appearance of their avatars)
* `Remove Changed Attributes`: This function compares the value of the saved objects to the current value of the objects in the `window` object. The function removes all objects from the snapshot whose value has changed. Then, it recursively explores both objects to identify identical nested objects, which are then retained in the snapshot, while all altered nested objects are discarded. The function also updates the value for the objects whose value remains unchanged from the `window` object.
* `Remove Unchanged Attributes`: This function is similar to `Remove Changed Attributes`. However, instead of removing the changed objects, it removes the objects that have not changed.
* `Download`: Save the snapshot object as a CSV file with three columns: object, path, and type.

### Inspecting the Result
To see the result of the snapshot, open the `DevTools`'s console. The snapshot is a JavaScript object that can be inspected by typing `snap`. This object contains the remaining objects (`snap.objects`) and paths (`snap.paths`) after executing the `DiffTracker`.

