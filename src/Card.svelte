<script>
  import ATextbox from './ATextbox.svelte'
  export let editable = false
  export let en = ''
  export let tw = ''
  export let partOfSpeech = ''
  export let isFront = true
</script>

<style>
  .card {
    width: 380px;
    height: 200px;
    border-radius: 10px;
    border: 5px solid #F083AC;
    background: #F083AC;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    box-shadow: inset 0px 0px 0px 1px #fff;
    padding: 4px;
    user-select: none;
  }
  
  .card__content {
    margin: 4px
  }

</style>
{#if isFront}
<div class="card">
  <div class="card__content">
      <ATextbox
      bind:value={en}
      fontSize={'3rem'}
      disabled={!editable}
    />
  </div>
  <div class="card__content">
    <ATextbox
      bind:value={partOfSpeech}
      disabled={!editable}
    />
  </div>
</div>
{:else}
<div class="card card__back">
  <div class="card__content">
    <ATextbox
      bind:value={tw}
      fontSize={'3rem'}
    >
    </ATextbox>
  </div>
</div>
{/if}