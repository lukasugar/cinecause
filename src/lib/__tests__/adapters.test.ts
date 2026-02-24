import { describe, it, expect } from 'vitest';
import {
  tmdbMovieToMediaItem,
  tmdbTvToMediaItem,
  tmdbMovieListToMediaItems,
  tmdbTvListToMediaItems,
} from '../adapters';
import type { TmdbMovie, TmdbTv, TmdbMovieDetail, TmdbTvDetail } from '../schemas';

describe('Adapters', () => {
  describe('tmdbMovieToMediaItem', () => {
    it('transforms a movie detail to MediaItem', () => {
      const movie: TmdbMovieDetail = {
        id: 550,
        title: 'Fight Club',
        poster_path: '/poster.jpg',
        release_date: '1999-10-15',
        overview: 'A movie about...',
        vote_average: 8.4,
        genres: [{ id: 18, name: 'Drama' }],
        runtime: 139,
        tagline: 'Mischief. Mayhem. Soap.',
        credits: {
          cast: [{ name: 'Brad Pitt', character: 'Tyler Durden', profile_path: '/brad.jpg', order: 0 }],
          crew: [{ name: 'David Fincher', job: 'Director', department: 'Directing' }],
        },
      };

      const result = tmdbMovieToMediaItem(movie);

      expect(result.id).toBe(550);
      expect(result.mediaType).toBe('movie');
      expect(result.title).toBe('Fight Club');
      expect(result.imageUrl).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
      expect(result.year).toBe(1999);
      expect(result.rating).toBe(8.4);
      expect(result.director).toBe('David Fincher');
      expect(result.cast?.[0].name).toBe('Brad Pitt');
    });
  });

  describe('tmdbTvToMediaItem', () => {
    it('transforms a TV detail to MediaItem', () => {
      const tv: TmdbTvDetail = {
        id: 1399,
        name: 'Game of Thrones',
        poster_path: '/got.jpg',
        first_air_date: '2011-04-17',
        overview: 'A TV show about...',
        vote_average: 8.4,
        genres: [{ id: 18, name: 'Drama' }],
        episode_run_time: [60],
        tagline: 'Winter is coming.',
        created_by: [{ name: 'David Benioff' }],
        credits: {
          cast: [{ name: 'Emilia Clarke', character: 'Daenerys', profile_path: '/emilia.jpg', order: 0 }],
          crew: [],
        },
      };

      const result = tmdbTvToMediaItem(tv);

      expect(result.id).toBe(1399);
      expect(result.mediaType).toBe('tv');
      expect(result.title).toBe('Game of Thrones');
      expect(result.year).toBe(2011);
      expect(result.director).toBe('David Benioff');
    });
  });

  describe('tmdbMovieListToMediaItems', () => {
    it('transforms movie list to MediaItems', () => {
      const movies: TmdbMovie[] = [
        { id: 1, title: 'Movie 1', poster_path: '/1.jpg', overview: 'test', vote_average: 7.0 },
        { id: 2, title: 'Movie 2', poster_path: null, overview: 'test', vote_average: 8.0 },
      ];

      const result = tmdbMovieListToMediaItems(movies);

      expect(result).toHaveLength(2);
      expect(result[0].mediaType).toBe('movie');
      expect(result[1].imageUrl).toBeNull();
    });
  });

  describe('tmdbTvListToMediaItems', () => {
    it('transforms TV list to MediaItems', () => {
      const tvShows: TmdbTv[] = [
        { id: 1, name: 'Show 1', poster_path: '/1.jpg', overview: 'test', vote_average: 7.0 },
      ];

      const result = tmdbTvListToMediaItems(tvShows);

      expect(result).toHaveLength(1);
      expect(result[0].mediaType).toBe('tv');
      expect(result[0].title).toBe('Show 1');
    });
  });
});
