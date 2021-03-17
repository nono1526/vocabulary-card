<script>
  import { onMount } from 'svelte'
  export let disabled = false
  export let value
  export let fontSize = '1rem'
  let inputElement
  $: inputStyle = `font-size: ${fontSize}`
  onMount(e => {
    inputElement.size = strLength(value)
  })

  function handleInput (event) {
    const newValue = event.target.value
    event.target.size = strLength(newValue)
  }

  function strLength(str) {
    let count = 1
    for (let i = 0, len = str.length; i < len; i++) {
        count += str.charCodeAt(i) < 256 ? 1 : 2
    }
    return count
}
</script>

<style>
  .a-textbox {
    color:  white;
    transition: .5s;
    background-color: transparent;
    border: none;
    width: auto;
    text-align: center;

  }
  .a-text--edit {
    border: 1px dashed #fff;
  }
  .a-textbox:focus {
    border: 1px dashed #fff;
    border-radius: 4px;
    outline: none;
    transform: scale(1.1);
  }
</style>

<input
  class="a-textbox"
  style={inputStyle}
  bind:value
  bind:this={inputElement}
  {disabled}
  class:a-text--edit={!disabled}
  on:input={handleInput}
/>