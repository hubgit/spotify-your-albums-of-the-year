require(['$api/library#Library', '$api/models#Promise', '$views/image#Image'],
	function(Library, Promise, Image) {

	var container = document.getElementById('albums');

	Library.forCurrentUser().starred.load('tracks').done(function(playlist) {
		playlist.tracks.snapshot().done(function(snapshot) {
			var promises = [];
			var albums = [];
			var counts = {};

			var year = ((new Date).getFullYear() - 1).toString();

			for (var i = 0; i < snapshot.length; i++) {
				var track = snapshot.get(i);

				var promise = track.album.load('date');

				promise.done(function(album) {
					if (album.date == year) {
						if (!counts[album.uri]) {
							albums.push(album);
							counts[album.uri] = 0;
						}

						counts[album.uri]++;
					}
				});

				promises.push(promise);
			}

			Promise.join(promises).always(function() {
				albums.sort(function(a, b) {
					return counts[b.uri] - counts[a.uri]
				});

				albums.forEach(function(album) {
					var block = document.createElement('div');
					block.className = 'album';

					var image = Image.forAlbum(album, { player: true });
					block.appendChild(image.node);

					var meta = document.createElement('div');
					meta.className = 'album-meta';

					var heading = document.createElement('div');
					heading.className = 'album-name';
					heading.textContent = album.name.decodeForText();
					meta.appendChild(heading);

					var artists = album.artists.map(function(artist) {
						return artist.name.decodeForText();
					}).join(', ');

					var heading = document.createElement('div');
					heading.className = 'artist-name';
					heading.textContent = artists;
					meta.appendChild(heading);

					var count = document.createElement('span');
					count.className = 'album-count';
					count.textContent = counts[album.uri];
					meta.appendChild(count);

					block.appendChild(meta);
					container.appendChild(block);

					console.log(artists + ' - ' + album.name.decodeForText() + ' (' + counts[album.uri] + ')');
				});
			});
		});
	});
});