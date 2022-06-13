import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SphereBuilder } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { GroundBuilder } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { CylinderBuilder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { OBJFileLoader } from "@babylonjs/loaders/OBJ/objFileLoader";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";
import { Mesh } from "@babylonjs/core/Meshes";
import { ammoModule, ammoReadyPromise } from "../externals/ammo";
import { CreateSceneClass } from "../createScene";

import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/core/"
import "@babylonjs/loaders/OBJ";

import mainModel from "../../assets/model.obj";
import { ActionManager, Color3, DirectionalLight, ExecuteCodeAction, PointLight, StandardMaterial } from "@babylonjs/core/";

class PhysicsSceneWithAmmo implements CreateSceneClass {
    preTasks = [ammoReadyPromise];

    degToRad(deg: any) {
        return (Math.PI * deg) / 180
    }

    makePhysicsObject = (newMeshes: any, scene: any, scaling: any) => {
        // Create physics root and position it to be the center of mass for the imported mesh
        var physicsRoot = new Mesh("physicsRoot", scene);
        // physicsRoot.position.y -= 0.9;
    
        // For all children labeled box (representing colliders), make them invisible and add them as a child of the root object
        newMeshes.forEach((m: any, i: any) => {
            console.log(newMeshes);
            // m.checkCollisions = true;
            if (m.name.indexOf("box") != -1) {
                m.isVisible = false
                physicsRoot.addChild(m)
            }
        })
    
        // Add all root nodes within the loaded gltf to the physics root
        newMeshes.forEach((m: any, i: any) => {
            if (m.parent == null){
                physicsRoot.addChild(m)
            }
        })
    
        // Make every collider into a physics impostor
        physicsRoot.getChildMeshes().forEach((m: any) => {
            if (m.name.indexOf("Box") != -1) {
                m.scaling.x = Math.abs(m.scaling.x)
                m.scaling.y = Math.abs(m.scaling.y)
                m.scaling.z = -Math.abs(m.scaling.z)
                // m.physicsImpostor = new PhysicsImpostor(m, PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
            }
        })
        
        // Scale the root object and turn it into a physics impsotor
        physicsRoot.scaling.scaleInPlace(scaling)
        // physicsRoot.physicsImpostor = new PhysicsImpostor(physicsRoot, PhysicsImpostor.NoImpostor, { mass: 0 }, scene);
        
        return physicsRoot
    }

    createScene = async (engine: Engine, canvas: HTMLCanvasElement): Promise<Scene> => {
        const scene = new Scene(engine);
        scene.useRightHandedSystem = true;

        // Lights
        // var light0 = new DirectionalLight("Omni", new Vector3(-2, -5, 2), scene);
        // var light1 = new PointLight("Omni", new Vector3(2, -5, -2), scene);
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        // Need a free camera for collisions
        const camera = new FreeCamera("FreeCamera", new Vector3(0, 0, -10), scene);

        camera.attachControl(canvas, true);
        camera.keysUpward.push(32);
        camera.keysUp.push(87); // w 
        camera.keysDown.push(83); // s
        camera.keysLeft.push(65); // a
        camera.keysRight.push(68); // d
        camera.minZ = 0;
        camera.speed = 1;
        
        canvas.addEventListener('click', () => { canvas.requestPointerLock(); });
    
        SceneLoader.ImportMeshAsync("", "", mainModel, scene, undefined, ".obj").then(function (result) {
            console.log(result);
            let rootMesh = result.meshes[0];
            rootMesh.name = "baseModelMesh";
            rootMesh.position = new Vector3(0, -20, -25);
              
            //   rootMesh.scaling.scaleInPlace(3)
            rootMesh.scaling = new Vector3(-1, 1, 1);
            result.meshes.forEach(mesh => {
                mesh.isPickable = false;
                mesh.checkCollisions = true;

                if (mesh.name.indexOf("Invisible") != -1) {
                    mesh.isVisible = false;
                }
            });
        });
    
        //Set gravity for the scene (G force like, on Y-axis)
        scene.gravity = new Vector3(0, -0.9, 0);
    
        // Enable Collisions
        scene.collisionsEnabled = true;
    
        //Then apply collisions and gravity to the active camera
        camera.checkCollisions = true;
        camera.applyGravity = true;
        //Set the ellipsoid around the camera (e.g. your player's size)
        camera.ellipsoid = new Vector3(1, 1, .5);
    
        return scene;
    };

    
}

export default new PhysicsSceneWithAmmo();
