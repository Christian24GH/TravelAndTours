const Ziggy = {"url":"http:\/\/localhost:8091","port":8091,"defaults":{},"routes":{"sanctum.csrf-cookie":{"uri":"sanctum\/csrf-cookie","methods":["GET","HEAD"]},"user":{"uri":"api\/user","methods":["GET","HEAD"]},"logout":{"uri":"api\/logout","methods":["POST"]},"competency.index":{"uri":"api\/competency","methods":["GET","HEAD"]},"competency.store":{"uri":"api\/competency","methods":["POST"]},"employees.index":{"uri":"api\/employees","methods":["GET","HEAD"]},"learning.index":{"uri":"api\/learning","methods":["GET","HEAD"]},"training.index":{"uri":"api\/training","methods":["GET","HEAD"]},"succession.index":{"uri":"api\/succession","methods":["GET","HEAD"]},"self.profile":{"uri":"api\/self\/profile","methods":["GET","HEAD"]},"self.profile.update":{"uri":"api\/self\/profile","methods":["POST"]},"self.competency":{"uri":"api\/self\/competency","methods":["GET","HEAD"]},"self.trainings":{"uri":"api\/self\/trainings","methods":["GET","HEAD"]},"self.trainings.request":{"uri":"api\/self\/trainings","methods":["POST"]},"self.work_progress":{"uri":"api\/self\/work-progress","methods":["GET","HEAD"]},"self.awards":{"uri":"api\/self\/awards","methods":["GET","HEAD"]},"storage.local":{"uri":"storage\/{path}","methods":["GET","HEAD"],"wheres":{"path":".*"},"parameters":["path"]}}};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
  Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };

if (typeof window !== 'undefined') {
    window.Ziggy = Ziggy;

    window.route = (name, params, absolute) => {
        if (window.Ziggy === undefined) {
            console.error('Ziggy is not defined. Ensure @routes is called in your template.');
            return '';
        }
        
        const route = window.Ziggy.routes[name];

        if (!route) {
            console.error(`Route "${name}" is not defined.`);
            return '';
        }

        let url = route.uri;

        // Replace parameters in the URL
        for (const key in params) {
            if (Object.hasOwnProperty.call(params, key)) {
                url = url.replace(`{${key}}`, params[key]);
            }
        }

        if (absolute) {
            return window.Ziggy.url + '/' + url;
        }

        return '/' + url;
    };
}
