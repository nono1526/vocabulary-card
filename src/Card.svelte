<script>
  import ATextbox from './ATextbox.svelte'

  export let en
  export let tw
  
</script>

<style>
  .card-maker {
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

</style>

<div class="card-maker" >
  {tw}
  <ATextbox
    bind:value={en}
    fontSize={'3rem'}
  />
  <ATextbox
    bind:value={tw}
  />
</div>
<button>SAVE</button>