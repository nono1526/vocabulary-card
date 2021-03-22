<script>
  import ATextbox from './ATextbox.svelte'
  import ATextarea from './ATextarea.svelte'
  import { createEventDispatcher } from 'svelte'
  export let editable = false
  export let en = ''
  export let tw = ''
  export let partOfSpeech = ''
  export let isFront = true
  export let example = ''

  const dispatcher = createEventDispatcher()
</script>

<style>
  .card {
    position: relative;
    width: 380px;
    height: 200px;
    transition: all 1s ease;
    transform-style: preserve-3d;
  }
  .card__inner {
    width: 100%;
    height: 100%;
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
    position: absolute;
    left: 0;
    top: 0;
  }
  
  .card__content {
    margin: 4px
  }
  .rotated {
    transform: rotateY(-180deg);
  }

  .card__front {
    transform-style: preserve-3d;
  }
  .card__back {
    transform-style: preserve-3d;
    transform: rotateY(180deg);
  }

  .card-depth {
   transform: translateZ(100px) scale(0.98);
   perspective: inherit;
}

</style>

<div class="card" class:rotated={!isFront}>
  <div class="card__inner card__front"
  on:click={e => dispatcher('click', e)}
  >
  <div class="card__content card-depth">
      <ATextbox
      bind:value={en}
      fontSize={'3rem'}
      disabled={!editable}
    />
  </div>
  <div class="card__content card-depth">
    <ATextbox
      bind:value={partOfSpeech}
      disabled={!editable}
    />
  </div>
  </div>
  <div class="card__inner card__back"
    on:click={e => dispatcher('click', e)}
  >
  <div class="card__content card-depth">
    <ATextbox
      bind:value={tw}
      fontSize={'3rem'}
      disabled={!editable}
    >
    </ATextbox>
  </div>
  <div class="card__content card-depth">
    <ATextarea
      bind:value={example}
      fontSize={'0.8rem'}
      disabled={!editable}
    >
    </ATextarea>
  </div>
  </div>
</div>