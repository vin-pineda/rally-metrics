import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AgentInfo = {
  role?: string;
  model?: string;
  output?: string;
};

type ProbabilityModel = {
  method?: string;
  features?: string[];
  guarantees?: string[];
  confidence?: string;
};

type AgentPipeline = {
  description?: string;
  agents?: AgentInfo[];
  guardrail?: string;
};

type ModelInfo = {
  version?: string;
  name?: string;
  summary?: string;
  probability_model?: ProbabilityModel;
  agent_pipeline?: AgentPipeline;
  limits?: string[];
};

type FetchState = "idle" | "loading" | "loaded" | "error";

/**
 * Collapsible "How predictions work" disclosure for the predictor page.
 * Fetches GET /api/v1/model/info lazily on first expand and caches the result
 * in state so re-toggling never refetches. Reads gracefully when any field is
 * missing and shows a small muted notice if the fetch fails.
 */
export default function ModelInfoDisclosure() {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [status, setStatus] = useState<FetchState>("idle");

  const loadInfo = async () => {
    setStatus("loading");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/model/info`,
      );

      if (!res.ok) {
        setStatus("error");

        return;
      }

      const data: ModelInfo = await res.json();

      setInfo(data);
      setStatus("loaded");
    } catch {
      setStatus("error");
    }
  };

  const toggle = () => {
    const next = !open;

    setOpen(next);

    if (next && status === "idle") {
      loadInfo();
    }
  };

  const probability = info?.probability_model;
  const pipeline = info?.agent_pipeline;
  const limits = info?.limits;

  return (
    <div className="max-w-3xl mx-auto mt-6 text-left">
      <button
        aria-expanded={open}
        className="flex items-center gap-1.5 mx-auto text-sm text-gray-500 hover:text-gray-700 transition-colors"
        type="button"
        onClick={toggle}
      >
        <span>How predictions work</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          className="h-4 w-4"
          fill="currentColor"
          transition={{ duration: 0.2 }}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            fillRule="evenodd"
          />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mt-4 p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              {status === "loading" && (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <svg
                    className="animate-spin h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      fill="currentColor"
                    />
                  </svg>
                  Loading model details…
                </div>
              )}

              {status === "error" && (
                <div className="text-sm text-gray-400 italic py-2">
                  Model details unavailable
                </div>
              )}

              {status === "loaded" && (
                <div className="space-y-6">
                  {(info?.name || info?.summary) && (
                    <div>
                      {info?.name && (
                        <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-1.5">
                          {info.name}
                        </div>
                      )}
                      {info?.summary && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {info.summary}
                        </p>
                      )}
                    </div>
                  )}

                  {probability &&
                    (probability.method ||
                      (probability.features &&
                        probability.features.length > 0) ||
                      (probability.guarantees &&
                        probability.guarantees.length > 0)) && (
                      <div>
                        <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">
                          Probability model
                        </div>

                        {probability.method && (
                          <p className="text-sm text-gray-700 leading-relaxed mb-3">
                            {probability.method}
                          </p>
                        )}

                        {probability.features &&
                          probability.features.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Features
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {probability.features.map((feature, i) => (
                                  <span
                                    key={`feature-${i}`}
                                    className="inline-block rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs text-gray-600"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {probability.guarantees &&
                          probability.guarantees.length > 0 && (
                            <ul className="space-y-1">
                              {probability.guarantees.map((guarantee, i) => (
                                <li
                                  key={`guarantee-${i}`}
                                  className="flex gap-2 text-sm text-gray-700"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="text-green-500"
                                  >
                                    ▲
                                  </span>
                                  <span>{guarantee}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    )}

                  {pipeline &&
                    (pipeline.description ||
                      (pipeline.agents && pipeline.agents.length > 0) ||
                      pipeline.guardrail) && (
                      <div>
                        <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">
                          Agent pipeline
                        </div>

                        {pipeline.description && (
                          <p className="text-sm text-gray-700 leading-relaxed mb-3">
                            {pipeline.description}
                          </p>
                        )}

                        {pipeline.agents && pipeline.agents.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {pipeline.agents.map((agent, i) => (
                              <div
                                key={`agent-${i}`}
                                className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm"
                              >
                                {agent.role && (
                                  <span className="font-semibold text-gray-800">
                                    {agent.role}
                                  </span>
                                )}
                                {agent.model && (
                                  <span className="inline-block rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-medium text-orange-600">
                                    {agent.model}
                                  </span>
                                )}
                                {agent.output && (
                                  <span className="text-gray-600">
                                    {agent.output}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {pipeline.guardrail && (
                          <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700">
                            {pipeline.guardrail}
                          </div>
                        )}
                      </div>
                    )}

                  {limits && limits.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Limitations
                      </div>
                      <ul className="space-y-1">
                        {limits.map((limit, i) => (
                          <li
                            key={`limit-${i}`}
                            className="flex gap-2 text-sm text-gray-500"
                          >
                            <span aria-hidden="true" className="text-gray-300">
                              •
                            </span>
                            <span>{limit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!info?.summary &&
                    !probability &&
                    !pipeline &&
                    (!limits || limits.length === 0) && (
                      <div className="text-sm text-gray-400 italic py-2">
                        Model details unavailable
                      </div>
                    )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
