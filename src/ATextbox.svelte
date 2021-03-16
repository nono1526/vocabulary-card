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
  .card-maker__text {
    color:  white;
    transition: .5s;
    background-color: transparent;
    border: none;
    width: auto;
    text-align: center;
  }
  .card-maker__text:focus {
    border: 1px dashed #fff;
    border-radius: 4px;
    outline: none;
    transform: scale(1.1);
  }
</style>

<input
  class="card-maker__text"
  style={inputStyle}
  bind:value
  bind:this={inputElement}
  {disabled}
  on:input={handleInput}
/>