export namespace Framework {

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
    }
}