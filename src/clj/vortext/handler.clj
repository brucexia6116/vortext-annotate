(ns vortext.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [noir.session :as session]
            [noir.response :refer [redirect]]
            [noir.util.middleware :refer [app-handler]]
            [taoensso.timbre :as timbre]
            [taoensso.timbre.appenders.rotor :as rotor]
            [environ.core :refer [env]]
            [vortext.middleware :refer [load-middleware]]
            [vortext.session-manager :as session-manager]
            [vortext.routes.auth :refer [auth-routes]]
            [vortext.routes.home :refer [home-routes]]
            [vortext.routes.project :refer [project-routes project-access]]
            [cronj.core :as cronj]
            [ring.middleware.anti-forgery :refer [*anti-forgery-token*]]))

(defroutes
  app-routes
  (route/resources "/static")
  (route/not-found "Page not found"))

(defn init!
  "init will be called once when app is deployed as a servlet on an
  app server such as Tomcat put any initialization code here"
  []
  (timbre/set-config!
   [:appenders :rotor]
   {:enabled? true
    :async? false
    :fn rotor/appender-fn})
  (timbre/set-config!
   [:shared-appender-config :rotor]
   {:path "vortext.log", :max-size (* 512 1024) :backlog 10})
  (if (env :dev) (selmer.parser/cache-off!))
  (selmer.parser/add-tag! :csrf-token (fn [_ _] *anti-forgery-token*))
  (cronj/start! session-manager/cleanup-job)
  (timbre/info "spa started successfully"))

(defn destroy!
  "destroy will be called when your application
  shuts down, put any clean up code here"
  []
  (timbre/info "spa is shutting down...")
  (cronj/shutdown! session-manager/cleanup-job)
  (shutdown-agents)
  (timbre/info "shutdown complete!"))

(def web-routes
  [auth-routes
   project-routes
   home-routes
   app-routes])

(def app
  (app-handler
   web-routes
   :middleware (load-middleware)
   :session-options {:timeout (* 60 30), :timeout-response (redirect "/")}
   :access-rules (concat project-access)))