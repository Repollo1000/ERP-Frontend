'use client';

import { useEffect } from 'react';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';
import { useCuenta } from '@/hooks/useCuenta';
import { PerfilTab } from '@/components/cuenta/PerfilTab';
import { SeguridadTab } from '@/components/cuenta/SeguridadTab';
import { EmailTab } from '@/components/cuenta/EmailTab';
import { SesionesTab } from '@/components/cuenta/SesionesTab';
import { ActividadTab } from '@/components/cuenta/ActividadTab';
import { DatosTab } from '@/components/cuenta/DatosTab';

export default function CuentaPage() {
  const cuenta = useCuenta();

  useEffect(() => {
    cuenta.cargarPerfil();
  }, [cuenta.cargarPerfil]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mi Cuenta</h1>
        <p className="text-foreground-muted mt-1">
          Administra tu perfil, seguridad y preferencias
        </p>
      </div>

      <Tabs defaultTab="perfil" className="space-y-6">
        <TabList>
          <Tab value="perfil">Perfil</Tab>
          <Tab value="seguridad">Seguridad</Tab>
          <Tab value="email">Email</Tab>
          <Tab value="sesiones">Sesiones</Tab>
          <Tab value="actividad">Actividad</Tab>
          <Tab value="datos">Mis Datos</Tab>
        </TabList>

        <TabPanel value="perfil" className="space-y-6">
          <PerfilTab
            perfil={cuenta.perfil}
            cargando={cuenta.cargando}
            onActualizar={cuenta.actualizarPerfil}
          />
        </TabPanel>

        <TabPanel value="seguridad" className="space-y-6">
          <SeguridadTab
            onCambiarContrasena={cuenta.cambiarContrasena}
            onRegenerarCodigos={cuenta.regenerarCodigos2FA}
            onDesactivarCuenta={cuenta.desactivarCuenta}
          />
        </TabPanel>

        <TabPanel value="email" className="space-y-6">
          <EmailTab
            perfil={cuenta.perfil}
            onCambiarEmail={cuenta.cambiarEmail}
          />
        </TabPanel>

        <TabPanel value="sesiones" className="space-y-6">
          <SesionesTab
            sesiones={cuenta.sesiones}
            cargando={cuenta.cargando}
            onCargar={cuenta.cargarSesiones}
            onCerrarSesion={cuenta.cerrarSesion}
            onCerrarOtras={cuenta.cerrarOtrasSesiones}
          />
        </TabPanel>

        <TabPanel value="actividad" className="space-y-6">
          <ActividadTab
            actividad={cuenta.actividad}
            cargando={cuenta.cargando}
            onCargar={cuenta.cargarActividad}
          />
        </TabPanel>

        <TabPanel value="datos" className="space-y-6">
          <DatosTab onExportar={cuenta.exportarDatos} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
