type Props = {
	question: string;
	answer: string;
};

export const InquiryAccordion: React.FC<Props> = ({ question, answer }) => (
	<div
		tabIndex={0}
		className=" collapse-arrow collapse my-4 max-w-xl cursor-pointer rounded-2xl border-[6px] border-base-100 bg-base-300 shadow-drop drop-shadow-lg hover:bg-base-200"
	>
		<input type="checkbox" />
		<div className="collapse-title text-2xl font-medium">{question}</div>
		<div className="collapse-content">
			<p className="font-thin">{answer}</p>
		</div>
	</div>
);
