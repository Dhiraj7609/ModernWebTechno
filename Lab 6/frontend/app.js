/* global angular */

const app = angular.module("northstarApp", ["ngRoute"]);

app.config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider
      .when("/", {
        templateUrl: "partials/list.html",
        controller: "ListCtrl",
      })
      .when("/new", {
        templateUrl: "partials/new.html",
        controller: "NewCtrl",
      })
      .when("/clients/:id", {
        templateUrl: "partials/details.html",
        controller: "DetailsCtrl",
      })
      .when("/clients/:id/edit", {
        templateUrl: "partials/edit.html",
        controller: "EditCtrl",
      })
      .otherwise({ redirectTo: "/" });
  },
]);

// ---------- API Service ----------
app.factory("ClientApi", [
  "$http",
  function ($http) {
    const base = "/api/clients";

    return {
      list: () => $http.get(base),
      get: (id) => $http.get(`${base}/${id}`),
      create: (payload) => $http.post(base, payload),
      update: (id, payload) =>
        $http.put(`${base}/${id}`, payload, {
          headers: { "Content-Type": "application/json" },
        }),
      remove: (id) => $http.delete(`${base}/${id}`),
    };
  },
]);

function normalizeError(err) {
  return err?.data?.error || err?.data?.message || err?.statusText || "Request failed";
}

// ---------- Controllers ----------
app.controller("ListCtrl", [
  "$scope",
  "$location",
  "ClientApi",
  function ($scope, $location, ClientApi) {
    $scope.loading = true;
    $scope.clients = [];
    $scope.total = 0;
    $scope.storage = "";
    $scope.filter = { q: "", risk: "" };
    $scope.error = "";

    $scope.refresh = function () {
      $scope.loading = true;
      $scope.error = "";

      ClientApi.list()
        .then((res) => {
          $scope.clients = res.data.clients || [];
          $scope.total = res.data.total || 0;
          $scope.storage = res.data.storage || "";
        })
        .catch((err) => {
          $scope.error = normalizeError(err);
        })
        .finally(() => {
          $scope.loading = false;
        });
    };

    $scope.view = function (id) {
      $location.path(`/clients/${id}`);
    };

    $scope.filteredClients = function () {
      const q = ($scope.filter.q || "").toLowerCase();
      const risk = $scope.filter.risk;

      return ($scope.clients || []).filter((c) => {
        const matchesRisk = !risk || c.riskCategory === risk;
        const hay = `${c.fullName} ${c.email} ${c.id}`.toLowerCase();
        const matchesQ = !q || hay.includes(q);
        return matchesRisk && matchesQ;
      });
    };

    $scope.refresh();
  },
]);

app.controller("DetailsCtrl", [
  "$scope",
  "$routeParams",
  "$location",
  "ClientApi",
  function ($scope, $routeParams, $location, ClientApi) {
    $scope.client = null;
    $scope.loading = true;
    $scope.error = "";

    const id = $routeParams.id;

    ClientApi.get(id)
      .then((res) => {
        $scope.client = res.data.clientt;
      })
      .catch((err) => {
        $scope.error = normalizeError(err);
      })
      .finally(() => {
        $scope.loading = false;
      });

    $scope.goEdit = function () {
      $location.path(`/clients/${id}/edit`);
    };

    $scope.goBack = function () {
      $location.path(`/`);
    };
  },
]);

app.controller("NewCtrl", [
  "$scope",
  "$location",
  "ClientApi",
  function ($scope, $location, ClientApi) {
    $scope.form = { fullName: "", email: "", riskCategory: "Medium" };
    $scope.saving = false;
    $scope.error = "";

    $scope.save = function () {
      $scope.error = "";
      if (!$scope.form.fullName || !$scope.form.email || !$scope.form.riskCategory) {
        $scope.error = "All fields are required";
        return;
      }

      $scope.saving = true;
      ClientApi.create($scope.form)
        .then((res) => {
          const id = res.data.client?.id;
          $location.path(id ? `/clients/${id}` : "/");
        })
        .catch((err) => {
          $scope.error = normalizeError(err);
        })
        .finally(() => {
          $scope.saving = false;
        });
    };
  },
]);

app.controller("EditCtrl", [
  "$scope",
  "$routeParams",
  "$location",
  "ClientApi",
  function ($scope, $routeParams, $location, ClientApi) {
    const id = $routeParams.id;
    $scope.form = null;
    $scope.loading = true;
    $scope.saving = false;
    $scope.error = "";

    ClientApi.get(id)
      .then((res) => {
        const c = res.data.clientt;
        $scope.form = {
          fullName: c.fullName,
          email: c.email,
          riskCategory: c.riskCategory,
        };
      })
      .catch((err) => {
        $scope.error = normalizeError(err);
      })
      .finally(() => {
        $scope.loading = false;
      });

    $scope.save = function () {
      $scope.error = "";
      if (!$scope.form?.fullName || !$scope.form?.email || !$scope.form?.riskCategory) {
        $scope.error = "All fields are required";
        return;
      }

      $scope.saving = true;
      ClientApi.update(id, $scope.form)
        .then(() => {
          $location.path(`/clients/${id}`);
        })
        .catch((err) => {
          $scope.error = normalizeError(err);
        })
        .finally(() => {
          $scope.saving = false;
        });
    };

    $scope.remove = function () {
      if (!confirm("Delete this client?")) return;
      $scope.saving = true;
      ClientApi.remove(id)
        .then(() => $location.path("/"))
        .catch((err) => {
          $scope.error = normalizeError(err);
        })
        .finally(() => {
          $scope.saving = false;
        });
    };
  },
]);
