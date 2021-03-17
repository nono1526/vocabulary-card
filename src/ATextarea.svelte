<script>
  export let value
  export let disabled = false
</script>

<style>
  .a-textarea {
    color:  white;
    background-color: transparent;
    border: none;
    width: auto;
    overflow: hidden;
    text-align: center;
    min-width: 360px;
  }

  .a-textarea--edit {
    border: 1px dashed #fff;
    
  }

  .a-textarea:focus {
    border-radius: 4px;
    outline: none;
  }
</style>

<textarea
  bind:value
  style={`resize: ${disabled ? 'none' : 'both'}`}
  class="a-textarea"
  {disabled}
  class:a-textarea--edit={!disabled}
></textarea>
