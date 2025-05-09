{
  config,
  pkgs,
  lib,
  ...
}:
let
  cfg = config.services.pythia-frontend;
  pythia-frontend = pkgs.callPackage ./package.nix { };
in
{
  options = {
    services.pythia-frontend = {
      enable = lib.mkEnableOption "Enable the Pythia frontend app";

      hostname = lib.mkOption {
        type = lib.types.str;
        default = "0.0.0.0";
        example = "127.0.0.1";
        description = ''
          The hostname under which the app should be accessible.
        '';
      };

      port = lib.mkOption {
        type = lib.types.port;
        default = 3000;
        example = 3000;
        description = ''
          The port under which the app should be accessible.
        '';
      };

      dbConnectionString = lib.mkOption {
        type = lib.types.str;
        default = "postgres://pythiafrontend:pythiafrontend@localhost:5432/pythia";
        example = "postgres://user:password@host:5432/database";
        description = ''
          Database to lookup information in.
        '';
      };

      asiApiKey = lib.mkOption {
        type = lib.types.str;
        default = "";
        example = "<YOUR-API-KEY>";
        description = ''
          API key to use for AI calls.
        '';
      };

      openFirewall = lib.mkOption {
        type = lib.types.bool;
        default = true;
        description = ''
          Whether to open ports in the firewall for this application.
        '';
      };
    };
  };

  config = lib.mkIf cfg.enable {
    users.groups.pythia-frontend = { };
    users.users.pythia-frontend = {
      isSystemUser = true;
      group = "pythia-frontend";
    };

    systemd.services.pythia-frontend = {
      wantedBy = [ "multi-user.target" ];
      description = "Chat-like interface to query a database in natural language and visualize the data output.";
      after = [ "network.target" ];
      environment = {
        HOSTNAME = cfg.hostname;
        PORT = toString cfg.port;
        DB_CONNECTION_STRING = cfg.dbConnectionString;
        ASI_API_KEY = cfg.asiApiKey;
      };
      serviceConfig = {
        ExecStart = "${lib.getExe pythia-frontend}";
        User = "pythia-frontend";
        Group = "pythia-frontend";
        CacheDirectory = "nextjs-app";
      };
    };

    networking.firewall = lib.mkIf cfg.openFirewall {
      allowedTCPPorts = [ cfg.port ];
    };
  };
}
