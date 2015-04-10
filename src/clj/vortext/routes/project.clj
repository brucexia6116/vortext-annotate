(ns vortext.routes.project
  (:import org.apache.commons.io.IOUtils
           java.util.zip.ZipOutputStream
           java.util.zip.ZipEntry
           java.io.ByteArrayOutputStream)
  (:require [compojure.core :refer :all]
            [clojure.java.jdbc :as jdbc]
            [clojure.java.io :as io]
            [ring.util.response :as resp]
            [noir.util.route :refer [restricted]]
            [noir.session :as session]
            [noir.response :as response]
            [taoensso.timbre :as timbre]
            [vortext.util :refer [breadcrumbs]]
            [vortext.http :as http]
            [vortext.routes.document :as document]
            [vortext.db.projects :as projects]
            [vortext.db.documents :as documents]
            [vortext.layout :as layout]))

(timbre/refer-timbre)

(defn parse-int [s] (Integer. (re-find  #"\d+" s)))

(defn current-user [] (session/get :user-id))

(defn overview-page
  [req]
  (layout/render "projects/overview.html"
                 {:breadcrumbs (breadcrumbs (:uri req) ["Projects"])
                  :projects (projects/for-user (current-user))}))

(defn edit-existing
  [id req]
  (if-let [project (projects/get id)]
    (layout/render "projects/edit.html"
                   {:project-id id
                    :project project
                    :dispatcher "project"
                    :breadcrumbs (breadcrumbs (:uri req) ["Projects" (:title project) "Edit"])})
    (resp/not-found (str "could not find project " id))))

(defn create-new
  [req]
  (layout/render "projects/edit.html"
                 {:breadcrumbs (breadcrumbs (:uri req) ["Projects"  "Create new"])
                  :dispatcher "project"
                  :project-id "new"}))

(defn edit-page
  [id req]
  (if (= id "new")
    (create-new req)
    (edit-existing (parse-int id) req)))

(defn handle-edit
  [id {:keys [params] :as req}]
  (let [{:keys [title description]} params
        categories (clojure.string/split (:categories params) #",")]
    (if (= id "new")
      (let [new-project (projects/create! (current-user) title description categories)]
        (resp/redirect (str "/projects/" new-project)))
      (do
        (projects/edit! (parse-int id) title description categories)
        (resp/redirect (str "/projects/" id))))))

(defn view
  [id req]
  (let [project (projects/get id)]
    (layout/render "projects/view.html"
                   {:dispatcher "documents"
                    :breadcrumbs (breadcrumbs (:uri req) ["Projects"  (:title project)])
                    :documents (documents/get-by-project id)
                    :project project})))

;; Export project to ZIP Archive
(defmacro ^:private with-entry
  [zip entry-name & body]
  `(let [^ZipOutputStream zip# ~zip]
     (.putNextEntry zip# (ZipEntry. ~entry-name))
     ~@body
     (flush)
     (.closeEntry zip#)))

(defn export-as-pdf
  [id req]
  (let [project (projects/get id)
        documents (documents/get-by-project id :marginalia true)]
    (with-open [output (ByteArrayOutputStream.)
                zip (ZipOutputStream. output)]
      (doall (map (fn [document]
                    (with-entry zip (:name document)
                      (with-open [doc (document/highlight document)]
                        (io/copy doc zip)))) documents))
      (http/as-attachment
       (resp/response (io/input-stream (.toByteArray output)))
       (str (:title project) ".zip")))))

(defn export-marginalia
  [id req]
  (let [project (projects/get id)
        documents (documents/get-by-project id :marginalia true)
        marginalia (map :marginalia documents)]
    (http/as-attachment
     (response/json marginalia)
     (str (:title project) ".json"))))

;;;;;;;;;;;;;;;
;; Routes
;;;;;;;;;;;;;;;
(defroutes project-routes
  (context "/projects" []
           (GET "/" [:as req]
                (restricted (overview-page req)))
           (context "/:project-id" [project-id]
                    (GET "/" [:as req]
                         (restricted (view (parse-int project-id) req)))
                    (POST "/" [:as req]
                          (restricted (handle-edit project-id req)))
                    (GET "/edit" [:as req]
                         (restricted (edit-page project-id req)))
                    (GET "/export/:type" [type :as req]
                         (restricted
                          (let [project (parse-int project-id)]
                            (case type
                              "pdf"  (export-as-pdf project req)
                              "json" (export-marginalia project req)))))
                    (context "/documents" []
                             (document/document-routes (parse-int project-id))))))
;;;;;;;;;;;;;;;
;; Access rules
;;;;;;;;;;;;;;;
(defn logged-in? [req]
  (not (nil? (current-user))))

(defn is-owner? [req]
  (let [project-id (get-in req [:params :project-id])]
    (if (and project-id (not= project-id "new"))
      (projects/has? (current-user) (parse-int project-id))
      true)))

(defn has-document? [req]
  (let [{project-id :project-id document-id :document-id} (:params req)]
    (documents/has? (parse-int project-id) document-id)))

(def project-access
  [{:uris ["/projects/:project-id/documents/:document-id"
           "/projects/:project-id/documents/:document-id/*"]
    :rules [logged-in? is-owner? has-document?]}
   {:uris ["/projects/:project-id"
           "/projects/:project-id/*"]
    :rules [logged-in? is-owner?]}
   {:uris ["/projects"
           "/projects/*"]
    :rules [logged-in?]}])