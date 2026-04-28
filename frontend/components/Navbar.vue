<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo Section -->
      <div class="navbar-logo">
        <img
          src="/images/logo.webp"
          alt="MobilitEirb Logo"
          class="logo-image"
        />
        <span class="logo-text">Mobilit<span class="green">Eirb</span></span>
      </div>

      <!-- Navigation Links (desktop) -->
      <div class="navbar-links">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-link"
          @click="handleNavbarLinkClick(link.path)"
        >
          {{ link.name }}
        </NuxtLink>
      </div>

      <!-- Account/Connection Section (desktop) -->
      <div class="navbar-account">
        <NuxtLink v-if="!isAuthenticated" to="/connexion" class="btn-connexion">
          Connexion
        </NuxtLink>

        <div v-else class="user-menu">
          <button @click="toggleMenu" class="user-button">
            <span class="user-avatar">{{ userInitials }}</span>
            <span class="user-name">{{ userName }}</span>
            <ChevronDown
              class="dropdown-icon"
              size="20"
              :class="{ open: isMenuOpen }"
            />
          </button>

          <div v-if="isMenuOpen" class="dropdown-menu">
            <div class="dropdown-header">
              <div class="dropdown-user-info">
                <div class="dropdown-avatar">{{ userInitials }}</div>
                <div class="dropdown-text">
                  <div class="dropdown-name">{{ userName }}</div>
                  <div class="dropdown-email">{{ user?.email }}</div>
                </div>
              </div>
            </div>

            <div class="dropdown-divider"></div>

            <NuxtLink
              to="/dashboard"
              class="dropdown-item"
              @click="handleDashboardClick"
            >
              <LayoutDashboard class="dropdown-icon" size="20" />
              <p>Dashboard</p>
            </NuxtLink>
            <NuxtLink to="/connexion" class="dropdown-item" @click="closeMenu">
              <CircleUserRound class="dropdown-icon" size="20" />
              <p>Mon profil</p>
            </NuxtLink>

            <div class="dropdown-divider"></div>

            <button @click="handleLogout" class="dropdown-item logout">
              <LogOut class="dropdown-icon" size="20" color="var(--danger)" />
              <p>Se déconnecter</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Hamburger Button (mobile only) -->
      <button
        class="hamburger-btn"
        @click.stop="toggleMobileMenu"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Menu navigation"
      >
        <X v-if="isMobileMenuOpen" size="24" />
        <Menu v-else size="24" />
      </button>
    </div>

    <!-- Mobile Menu Panel -->
    <Transition name="slide-down">
      <div v-if="isMobileMenuOpen" class="mobile-menu">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="mobile-nav-link"
          @click="() => { handleNavbarLinkClick(link.path); closeMobileMenu(); }"
        >
          {{ link.name }}
        </NuxtLink>

        <div class="mobile-divider"></div>

        <NuxtLink
          v-if="!isAuthenticated"
          to="/connexion"
          class="mobile-auth-btn"
          @click="closeMobileMenu"
        >
          Connexion
        </NuxtLink>

        <div v-else class="mobile-user-section">
          <div class="mobile-user-info">
            <div class="mobile-user-avatar">{{ userInitials }}</div>
            <div class="mobile-user-text">
              <div class="mobile-user-name">{{ userName }}</div>
              <div class="mobile-user-email">{{ user?.email }}</div>
            </div>
          </div>
          <div class="mobile-divider"></div>
          <NuxtLink
            to="/dashboard"
            class="mobile-nav-link"
            @click="() => { handleDashboardClick(); closeMobileMenu(); }"
          >
            <LayoutDashboard size="18" />
            <span>Dashboard</span>
          </NuxtLink>
          <button
            @click="() => { handleLogout(); closeMobileMenu(); }"
            class="mobile-nav-link mobile-logout"
          >
            <LogOut size="18" color="var(--danger)" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
const { user, isAuthenticated, logout, checkAuth } = useAuth();
const { clearMobilite } = useMobiliteSession();
const isMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
import {
  LayoutDashboard,
  CircleUserRound,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-vue-next";

const navLinks = [
  { name: "Accueil", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Recherche", path: "/recherche" },
];

onMounted(async () => {
  await checkAuth();
});

const userInitials = computed(() => {
  if (!user.value) return "?";
  const firstName = user.value.given_name?.[0] || "";
  const lastName = user.value.family_name?.[0] || "";
  return (firstName + lastName).toUpperCase() || "U";
});

const userName = computed(() => {
  if (!user.value) return "";
  return `${user.value.given_name || ""} ${
    user.value.family_name || ""
  }`.trim();
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) isMenuOpen.value = false;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleNavbarLinkClick = (path) => {
  if (path === "/dashboard") {
    clearMobilite();
  }
};

const handleDashboardClick = () => {
  clearMobilite();
  closeMenu();
};

const handleLogout = () => {
  closeMenu();
  logout();
};

onMounted(() => {
  const handleClickOutside = (event) => {
    const path = event.composedPath();
    const isInsideUserMenu = path.some((el) =>
      el?.classList?.contains?.("user-menu")
    );
    const isInsideNavbar = path.some((el) =>
      el?.classList?.contains?.("navbar")
    );

    if (!isInsideUserMenu) isMenuOpen.value = false;
    if (!isInsideNavbar) isMobileMenuOpen.value = false;
  };

  document.addEventListener("click", handleClickOutside);

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
});
</script>

<style scoped>
.navbar {
  background-color: var(--background);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-image {
  height: 40px;
  width: auto;
}

.logo-text {
  font-family: var(--font-ubuntu);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;

  & .green {
    color: var(--primary);
  }
}

.navbar-links {
  display: flex;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  position: relative;
  padding: 0.5rem 1rem;
  color: var(--text);
  font-weight: 500;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: color 0.2s ease, background-color 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    bottom: 2px;
    left: 1rem;
    right: 1rem;
    height: 2px;
    border-radius: 2px;
    background: var(--primary);
    transform: scaleX(0);
    transition: transform 0.25s ease;
  }

  &:hover {
    color: var(--primary);

    &::after {
      transform: scaleX(0.5);
    }
  }

  &.router-link-exact-active {
    color: var(--primary);
    font-weight: 600;

    &::after {
      transform: scaleX(1);
    }
  }
}

.navbar-account {
  display: flex;
  align-items: center;
  position: relative;
}

.btn-connexion {
  padding: 0.5rem 1.5rem;
  background-color: var(--primary);
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn-connexion:hover {
  opacity: 0.9;
}

/* User menu styles */
.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 100px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: radial-gradient(
    circle at 30% 30%,
    oklch(70.62% 0.139 158.37) 30%,
    oklch(43.15% 0.073 199.96)
  );
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  font-weight: 500;
  color: var(--text);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 0.75rem;
  color: var(--text);
  transition: transform 0.2s;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 280px;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 0.75rem;
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dropdown-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: radial-gradient(
    circle at 30% 30%,
    oklch(70.62% 0.139 158.37) 30%,
    oklch(43.15% 0.073 199.96)
  );
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.dropdown-text {
  flex: 1;
  min-width: 0;
}

.dropdown-name {
  font-weight: 600;
  color: var(--text);
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-email {
  font-size: 0.875rem;
  color: var(--text);
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1;

  width: 100%;
  padding: 0.75rem;
  text-align: left;
  color: var(--text);
  text-decoration: none;
  border-radius: 0.375rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dropdown-item.logout {
  color: #e74c3c;
  font-weight: 500;
}

.dropdown-item.logout:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

/* ===== HAMBURGER BUTTON ===== */
.hamburger-btn {
  display: none;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  border-radius: 0.375rem;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.hamburger-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* ===== MOBILE MENU ===== */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--background);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 0.75rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  z-index: 999;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text);
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.mobile-nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.mobile-nav-link.router-link-exact-active {
  color: var(--primary);
  font-weight: 600;
  background-color: oklch(70.62% 0.139 158.37 / 0.08);
}

.mobile-divider {
  height: 1px;
  background-color: rgba(0, 0, 0, 0.08);
  margin: 0.375rem 0;
}

.mobile-auth-btn {
  display: block;
  padding: 0.75rem 1rem;
  background: var(--gradientCallToAction);
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
  text-align: center;
  transition: opacity 0.2s;
}

.mobile-auth-btn:hover {
  opacity: 0.9;
}

.mobile-user-section {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem 0.75rem;
}

.mobile-user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: radial-gradient(
    circle at 30% 30%,
    oklch(70.62% 0.139 158.37) 30%,
    oklch(43.15% 0.073 199.96)
  );
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.mobile-user-text {
  min-width: 0;
}

.mobile-user-name {
  font-weight: 600;
  color: var(--text);
  font-size: 0.95rem;
}

.mobile-user-email {
  font-size: 0.8rem;
  color: var(--text);
  opacity: 0.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-logout {
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-family: inherit;
  color: var(--danger);
}

/* ===== TRANSITIONS ===== */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .navbar {
    padding: 0.75rem 1rem;
  }

  .navbar-container {
    gap: 0;
  }

  .navbar-links {
    display: none;
  }

  .navbar-account {
    display: none;
  }

  .hamburger-btn {
    display: flex;
  }
}
</style>
