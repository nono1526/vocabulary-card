<script>
  import Card from './Card.svelte'
  let en = 'Hello'
  let tw = '你好'
</script>

<style>
  .card-maker {
    
  }

</style>

<div class="card-maker">
  <Card {en} {tw} editable={true}></Card>
</div>