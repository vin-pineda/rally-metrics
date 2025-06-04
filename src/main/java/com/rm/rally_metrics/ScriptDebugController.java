package com.rm.rally_metrics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/debug")
public class ScriptDebugController {
    @Autowired
    private StatsSyncScheduler scheduler;

    @GetMapping("/run-script")
    public String runScriptNow() {
        System.out.println("===== /debug/run-script endpoint HIT =====");
        scheduler.runPythonScript();
        return "Script triggered manually";
    }
}