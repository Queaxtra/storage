<script>
  import "../app.postcss";
</script>

<slot />

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap');

  :global(body) {
    background-color: #111111;
    font-family: 'Inter', sans-serif;
    color: white;
  }
</style>