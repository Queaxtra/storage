<script>
  import "../app.postcss";
</script>

<slot />

<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500&display=swap');

  :global(body) {
    background-color: #111111;
    font-family: 'Outfit', sans-serif;
    color: white;
  }
</style>