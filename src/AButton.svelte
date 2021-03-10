<script>
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher()

  export let dark = false

  function handleButtonClick (e) {
    dispatch('click', e)
  }
</script>

<style>
.a-btn {
  border: 2px solid #A0E7E5;
  outline: none;
  cursor: pointer;
  border-radius: 8px;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 36px;
  transition: .33s
}

.a-btn--dark .a-btn__content{
  color: #fff;
}

.a-btn:hover {
  border: 2px solid #99e5e3;
  background-color: #A0E7E534;
}

.a-btn__content {
  color: #313131;
  min-width: 80px;
}
</style>

<button
  on:click={handleButtonClick}
  class="a-btn"
  class:a-btn--dark={dark}
>
  <span class="a-btn__content">
    <slot></slot>
  </span>
</button>