-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  username character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  nickname character varying,
  avatar character varying,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cards (
  id integer NOT NULL DEFAULT nextval('cards_id_seq'::regclass),
  user_id integer,
  title character varying NOT NULL,
  content text NOT NULL,
  type character varying NOT NULL,
  answer text,
  visibility character varying DEFAULT 'private'::character varying,
  is_pinned boolean DEFAULT false,
  difficulty character varying,
  last_reviewed_at timestamp with time zone,
  mastery character varying DEFAULT 'new'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cards_pkey PRIMARY KEY (id),
  CONSTRAINT cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.tags (
  id integer NOT NULL DEFAULT nextval('tags_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.card_tags (
  card_id integer NOT NULL,
  tag_id integer NOT NULL,
  CONSTRAINT card_tags_pkey PRIMARY KEY (card_id, tag_id),
  CONSTRAINT card_tags_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id),
  CONSTRAINT card_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);
CREATE TABLE public.likes (
  id integer NOT NULL DEFAULT nextval('likes_id_seq'::regclass),
  user_id integer,
  card_id integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT likes_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id)
);
CREATE TABLE public.favorites (
  id integer NOT NULL DEFAULT nextval('favorites_id_seq'::regclass),
  user_id integer,
  card_id integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT favorites_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id)
);
CREATE TABLE public.review_logs (
  id integer NOT NULL DEFAULT nextval('review_logs_id_seq'::regclass),
  user_id integer,
  card_id integer,
  mastery character varying NOT NULL,
  reviewed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT review_logs_pkey PRIMARY KEY (id),
  CONSTRAINT review_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT review_logs_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id)
);