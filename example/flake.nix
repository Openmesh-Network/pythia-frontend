{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    pythia-frontend.url = "github:Openmesh-Network/pythia-frontend";
  };

  outputs =
    {
      self,
      nixpkgs,
      pythia-frontend,
      ...
    }:
    let
      system = "x86_64-linux";
    in
    {
      nixosConfigurations.container = nixpkgs.lib.nixosSystem {
        inherit system;
        specialArgs = {
          inherit pythia-frontend;
        };
        modules = [
          (
            { pythia-frontend, ... }:
            {
              imports = [
                pythia-frontend.nixosModules.default
              ];

              boot.isContainer = true;

              services.pythia-frontend = {
                enable = true;
              };

              networking = {
                firewall.allowedTCPPorts = [
                  3000
                ];

                useHostResolvConf = nixpkgs.lib.mkForce false;
              };

              services.resolved.enable = true;

              system.stateVersion = "25.05";
            }
          )
        ];
      };
    };
}
