import InfoContainer from '../../components/common/InfoContainer';

const FaqItem = ({ id, question, answer }: { id: string; question: string; answer: string }) => (
  <div className="accordion-item card-custom">
    <h2 className="accordion-header" id={`heading-${id}`}>
      <button className="accordion-button collapsed bg-dark text-white" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${id}`} aria-expanded="false" aria-controls={`collapse-${id}`}>
        {question}
      </button>
    </h2>
    <div id={`collapse-${id}`} className="accordion-collapse collapse" aria-labelledby={`heading-${id}`} data-bs-parent="#faqAccordion">
      <div className="accordion-body text-white-50">
        {answer}
      </div>
    </div>
  </div>
);

function Faq() {
  const faqs = [
    {
      id: "one",
      question: "¿Cuáles son los requisitos de inscripción?",
      answer: "Para inscribirte, necesitas presentar tu DNI, título secundario o constancia de título en trámite, y completar el formulario de preinscripción online. Luego, deberás acercarte al departamento de alumnos para finalizar el proceso."
    },
    {
      id: "two",
      question: "¿La cursada es virtual, presencial o mixta?",
      answer: "Ofrecemos modalidades adaptadas a cada carrera. La mayoría de nuestras tecnicaturas cuentan con un sistema híbrido flexible, mientras que las licenciaturas tienen una mayor carga presencial para fomentar la práctica en nuestros laboratorios."
    },
    {
      id: "three",
      question: "¿Existen becas o ayudas económicas?",
      answer: "Sí, contamos con un programa de becas por mérito académico y ayudas económicas para estudiantes que lo necesiten. La convocatoria se abre al inicio de cada semestre y puedes consultar los requisitos en la sección de Bienestar Estudiantil."
    }
  ];

  return (
    <InfoContainer>
      <div className="container mt-4" style={{ maxWidth: '900px' }}>
        <h1 className="display-4 mb-4">Preguntas Frecuentes</h1>
        <div className="accordion" id="faqAccordion">
          {faqs.map(faq => <FaqItem key={faq.id} {...faq} />)}
        </div>
      </div>
    </InfoContainer>
  );
}

export default Faq;