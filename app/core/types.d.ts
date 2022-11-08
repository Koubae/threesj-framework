export namespace Framework {

    export namespace Types {
        type Nullable<T> = T | null;
    }

    // Player Types
    export namespace Player {
        interface userInputInterface {
            allKeyPressed: string[]
            keyUpCurrent: string|null
            keyUpPrevious: string|null

            keyDownCurrent: string|null
            keyDownPrevious: string|null

            pointer: {
                x: null|number,
                y: null|number
            }
        }

        interface userControlState {
            jumping: {
                coolDown: number
                coolDownCurrent: number
                active: boolean
                doubleJump: boolean
                doubleJumpActive: boolean
            },
            onGround: boolean
        }

        interface userControlInterface {
            forward: boolean
            backward: boolean
            left: boolean
            right: boolean

            turnLeft: boolean
            turnRight: boolean

            panUp: number
            panDown: number
            panLeft: number
            panRight: number

            jump: boolean
            sprint: boolean
        }
    }
}