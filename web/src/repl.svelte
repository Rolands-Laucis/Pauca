<script>
    import Nav from './nav.svelte'
    import {Transpile, TranspileMode} from 'pauca/transpile.js'

    let source_code_panel, input_code_panel, output = '', error = false

    function Run(mode = TranspileMode.REPLACE){
        try{
            output = Transpile(source_code_panel.value, input_code_panel.value, {mode:mode, verbose:true})
            error = false
        }catch(e){
            error = true
            output = 'Transpilation error, please check .pau file for mistakes or the debug console for more information\n\n' + e.stack
            console.log(e)
        }
    }
</script>

<main class="page">
    <h1>pauca repl</h1>

    <div class="buttons">
        <h2>[</h2>
        <h2>run</h2>
        <button on:click={() => {Run()}}>default</button>
        <button on:click={() => {Run(TranspileMode.SINGLE)}}>single</button>
        <button on:click={() => {Run(TranspileMode.MULTIPLE)}}>multiple</button>
        <button on:click={() => {Run(TranspileMode.REPLACE)}}>replace</button>
        <h2>]</h2>
    </div>

    <div class="panels">
        <section style="grid-area: source;">
            <h3>./source.pau</h3>
            <textarea name="pauca source" id="source" bind:this={source_code_panel}>//calculates e via a tailor series. Feel free to edit :)
                
[p] ["loop = "] [var "times"] [/p]
[target]
    [\
        [def [sum] 1]
        [def [x] 1]
        [def [mul] 1]
    ]

    [loop [times]][\
            [+ [sum] [/ 1 [mul]]]
            [* [mul] [+ [x] 1]]
    ][/loop]

    e = [sum] with [times] iterations
[/target]</textarea>
        </section>
        <section style="grid-area: in;">
            <h3>./input.txt</h3>
            <textarea name="input text" id="input" bind:this={input_code_panel}>*some text, feel free to edit :)*
loop = 5

*some more text*
loop = 10</textarea>
        </section>
        <section style="grid-area: out;">
            <h3>./output.txt</h3>
            <textarea class:error name="output text" id="output" readonly>{output}</textarea>
        </section>
    </div>
</main>
<Nav></Nav>

<style lang="scss">
    main{
        height: 100vh;
        padding: 24px 140px;

        display: flex;
        flex-direction: column;
    }

    h1{
        @include title;
    }

    .buttons{
        width: 100%;
        height: 48px;
        margin: 12px 0px;

        display: flex;
        align-items: center;
        justify-content: center;
        gap:24px;

        h2{
            @include seg_text;
            &::before{content: ""}
            &::after{content: ""}
        }

        button{
            @include seg_text;
            font-size: 18px;

            border: none;
            background-color: $dark;
            padding: 6px;
            color: $green;

            transition: 120ms ease-in-out;
            &:hover{
                background-color: $light_grey;
                cursor: pointer;
            }
        }
    }

    .panels{
        width: 100%;
        flex-grow: 1;

        display: grid;
        grid-template-areas: 
            "source in" 
            "source out";
        gap: 24px;
    }

    section{
        display: flex;
        flex-direction: column;
        background: $light_grey;

        h3{
            @include code_text;
            background: $dark;
            color: $light_grey;
            padding: 12px;
        }

        textarea{
            @include code_text;

            height: 100%;

            resize: none;
            border: none;
            background: transparent;
            padding: 12px;

            &:focus{outline: none;}
        }

        .error{
            color: $red;
        }
    }
</style>