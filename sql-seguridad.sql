-- ============================================================
-- SEGURIDAD: Fijar RPC eliminar_usuario_auth + RLS policies
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase (https://supabase.com/dashboard)

-- ============================================================
-- 1. Fix RPC: solo admin puede eliminar usuarios
-- ============================================================

CREATE OR REPLACE FUNCTION eliminar_usuario_auth(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que quien llama es admin
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: se requiere rol admin';
  END IF;

  -- Eliminar de auth.users y público
  DELETE FROM auth.users WHERE id = user_id;
  DELETE FROM public.usuarios WHERE id = user_id;
END;
$$;

-- ============================================================
-- 2. Asegurar RLS está habilitado en todas las tablas
-- ============================================================

ALTER TABLE public.torneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jugador_equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarjetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Crear o reemplazar policies
-- ============================================================

-- Helper: eliminar policies existentes para recrearlas limpias
DO $$ BEGIN
  EXECUTE COALESCE(
    (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON ' || quote_ident(tablename) || ';', E'\n')
     FROM pg_policies WHERE schemaname = 'public'),
    'SELECT 1'
  );
END $$;

-- TORNEOS
CREATE POLICY "torneos_select_public" ON public.torneos FOR SELECT USING (true);
CREATE POLICY "torneos_insert_admin" ON public.torneos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "torneos_update_admin" ON public.torneos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "torneos_delete_admin" ON public.torneos FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);

-- EQUIPOS
CREATE POLICY "equipos_select_public" ON public.equipos FOR SELECT USING (true);
CREATE POLICY "equipos_insert_admin" ON public.equipos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "equipos_update_admin" ON public.equipos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "equipos_delete_admin" ON public.equipos FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);

-- JUGADORES
CREATE POLICY "jugadores_select_public" ON public.jugadores FOR SELECT USING (true);
CREATE POLICY "jugadores_insert_admin" ON public.jugadores FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "jugadores_update_admin" ON public.jugadores FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "jugadores_delete_admin" ON public.jugadores FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);

-- JUGADOR_EQUIPO
CREATE POLICY "jugador_equipo_select_public" ON public.jugador_equipo FOR SELECT USING (true);
CREATE POLICY "jugador_equipo_insert_admin" ON public.jugador_equipo FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "jugador_equipo_update_admin" ON public.jugador_equipo FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "jugador_equipo_delete_admin" ON public.jugador_equipo FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);

-- FIXTURE
CREATE POLICY "fixture_select_public" ON public.fixture FOR SELECT USING (true);
CREATE POLICY "fixture_insert_admin" ON public.fixture FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "fixture_update_admin" ON public.fixture FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "fixture_delete_admin" ON public.fixture FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);

-- RESULTADOS
CREATE POLICY "resultados_select_public" ON public.resultados FOR SELECT USING (true);
CREATE POLICY "resultados_insert_admin" ON public.resultados FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "resultados_update_admin" ON public.resultados FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "resultados_delete_admin" ON public.resultados FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);

-- GOLES
CREATE POLICY "goles_select_public" ON public.goles FOR SELECT USING (true);
CREATE POLICY "goles_insert_admin" ON public.goles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "goles_delete_admin" ON public.goles FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);

-- TARJETAS
CREATE POLICY "tarjetas_select_public" ON public.tarjetas FOR SELECT USING (true);
CREATE POLICY "tarjetas_insert_admin" ON public.tarjetas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('admin', 'arbitro'))
);
CREATE POLICY "tarjetas_delete_admin" ON public.tarjetas FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);

-- USUARIOS (solo lectura pública, escritura solo admin)
CREATE POLICY "usuarios_select_public" ON public.usuarios FOR SELECT USING (true);
CREATE POLICY "usuarios_insert_admin" ON public.usuarios FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "usuarios_update_admin" ON public.usuarios FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "usuarios_delete_admin" ON public.usuarios FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);


-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- Para verificar que las policies se crearon:
-- SELECT * FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
