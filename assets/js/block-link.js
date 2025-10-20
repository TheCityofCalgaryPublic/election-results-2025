  $(document).ready(function () {
    $('.block-link').on('click', function (e) {
      if (!$(e.target).closest('a').length) {
        const link = $(this).find('a').attr('href');
        if (link) {
          window.location.href = link;
        }
      }
    });
  });
