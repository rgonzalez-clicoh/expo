package abi44_0_0.host.exp.exponent

import abi44_0_0.expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.SingletonModule
import abi44_0_0.host.exp.exponent.modules.universal.ExpoModuleRegistryAdapter

interface ExponentPackageDelegate {
  fun getScopedModuleRegistryAdapterForPackages(
    packages: List<Package>,
    singletonModules: List<SingletonModule>
  ): ExpoModuleRegistryAdapter?
}
